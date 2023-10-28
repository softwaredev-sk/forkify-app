import * as model from './model.js'; //model of MVC
import recipeView from './views/recipeView.js'; //one of the Views of MVC
import searchView from './views/searchView.js'; //one of the Views of MVC for search view
import resultsView from './views/resultsView.js'; //one of the Views of MVC for results view
import paginationView from './views/paginationView.js';

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
    //1) loading the recipe
    await model.loadRecipe(id); //here we get access to state.recipe

    //2) rendering Recipes
    recipeView.render(model.state.recipe);
    // recipeView.renderMessage();
  } catch (err) {
    recipeView.renderError();
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

// controlSearchResults(); //for testing

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
  console.log('Page Controller');
};

const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResults); //handler defined in recipeView since it was modifying DOM on events and it represents presentation layer
  paginationView.addHandlerClick(controlPagination);
};

init(); //initialized immediately to import addHandlerRender in controller.js
