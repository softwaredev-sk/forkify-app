import * as model from './model.js'; //model of MVC
import recipeView from './views/recipeView.js'; //one of the Views of MVC

import 'core-js/stable'; //for polyfilling everything else except async-await
import 'regenerator-runtime/runtime'; //for polyfilling asyn-await

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

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
    // alert(err);
    recipeView.renderError();
  }
};

// controlRecipes();

// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipes)
// );

const init = function () {
  recipeView.addHandlerRender(controlRecipes); //handler defined in recipeView since it was modifying DOM on events and it represents presentation layer
};

init(); //initialized immediately to import addHandlerRender in controller.js
