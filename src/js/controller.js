import * as model from './model.js'; //model of MVC
import recipeView from './views/recipeView.js'; //one of the Views of MVC
import searchView from './views/searchView.js'; //one of the Views of MVC for search view
import resultsView from './views/resultsView.js'; //one of the Views of MVC for results view
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable'; //for polyfilling everything else except async-await
import 'regenerator-runtime/runtime'; //for polyfilling asyn-await
import { async } from 'regenerator-runtime';

//module.hot is not part of javascript, it is used for parcel to not reload whole page everytime.
if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); //reading hash from url bar without the leading # symbol

    if (!id) return; //guard clause

    //loading spinner until recipe loads
    recipeView.renderSpinner();

    //Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    //Updating bookmarks View
    bookmarksView.update(model.state.bookmarks);

    //1) loading the recipe
    await model.loadRecipe(id); //here we get access to state.recipe

    //2) rendering Recipes
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.log(err);
  }
};

// controlRecipes();

// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipes)
// );

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //get search query
    const query = searchView.getQuery();
    if (!query) return;

    // load search results
    await model.loadSearchResults(query);
    //Render results
    resultsView.render(model.getSearchResultsPage());

    //Render intial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError();
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add or Remove the bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //update recipe view
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Showing Loading Spinner
    addRecipeView.renderSpinner();

    //Upload the new Recipe
    await model.uploadRecipe(newRecipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change hash in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      addRecipeView.render(true); //as render did not need any data, and without truthy value of data, the code will return without rendering.
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

//Subscriber from publisher-subscriber pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults); //handler defined in recipeView since it was modifying DOM on events and it represents presentation layer
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init(); //initialized immediately to import event handlers in controller.js from view pages
