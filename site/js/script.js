$(function () {
    $("#navbarToggle").blur(function (event){
        var screenWidth = window.innerWidth;
        if(screenWidth < 768){
            $("#collapsable-nav").collapse('hide');
            
        }
    });
});

/* makes the ajax request to that app, brings in the data as Json
parses it and populates an html snippet that is then able to be inserted
inside of that html as the complete set of html tags that we need
in order to display the menu categories page*/

( function (global){

    var dc = {};
    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var menuItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-item.html";

    // Convenience function for inserting innerHTML for 'select'
    var insertHtml = function (selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };

    // Show loading icon inside element identified by 'selector'.
    var showLoading = function(selector){
        var html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHtml(selector, html);
    };

    /* we grab category div as a string then we need to substitude every
    property with a value */
    var insertProperty = function (string, probName, propValue){
        //string is the place we are going to insert things into
        //insert propValue instead propName there to the string
        var propToReplace = "{{" + probName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        //g means that u should replace in all places that u find a match not just first one
        return string;
    } ;


    // Remove the class 'active' from home and switch to Menu button
    var switchMenuToActive = function () {
        // Remove 'active' from home button
        var classes = document.querySelector("#navHomeButton").className;
        classes = classes.replace(new RegExp("active", "g"), "");
        document.querySelector("#navHomeButton").className = classes;

        // Add 'active' to menu button if not already there
        classes = document.querySelector("#navMenuButton").className;
        if (classes.indexOf("active") == -1) {
            classes += " active";
            document.querySelector("#navMenuButton").className = classes;
        }
    };

    // On page load (before images or CSS)
    document.addEventListener("DOMContentLoaded", function (event){
        // On first load, show home view
        showLoading("#main-content");
        console.log("here");
        $ajaxUtils.sendGetRequest(
            homeHtml,
            function (responseText) {
                document.querySelector("#main-content").innerHTML = responseText;
            },
            false);
    });
    
    //load the menu categories view
    dc.loadMenuCategories = function (){
        showLoading("#main-content");
        console.log("here2");
        $ajaxUtils.sendGetRequest(
            allCategoriesUrl, buildAndShowCategoriesHTML);
    };
    /* Builds HTML for the categories page based on the data from the server */
    function buildAndShowCategoriesHTML(categories){
        console.log("here3");
        //load title snippet of categories page
        $ajaxUtils.sendGetRequest(
            categoriesTitleHtml, function (categoriesTitleHtml){
                //retrieve single category snippet
                $ajaxUtils.sendGetRequest(
                    categoryHtml, function (categoryHtml){
                        switchMenuToActive();
                        var categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml ); //to make the page using snippets
                        insertHtml("#main-content", categoriesViewHtml);
                    },false
                );
            },false
        );
    }
    /* using categories data and snippets html build categories view html to be inserted into paga */
    function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml){
        var finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";
        //loop over categories
        for(var i = 0 ; i< categories.length; i++){
            //insert category values
            var html = categoryHtml;
            var name = categories[i].name;
            var short_name = categories[i].short_name;
            html = insertProperty(html, "name", name);
            html = insertProperty(html, "short_name",short_name);
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    //load the menu items view
    //'categoryShort' is a short_name for a category
    dc.loadMenuItems = function (categoryShort){
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML);
    };

    /* Builds HTML for the categories page based on the data from the server */
    function buildAndShowMenuItemsHTML(categoryMenuItems){
        //load title snippet of categories page
        $ajaxUtils.sendGetRequest(
            menuItemsTitleHtml, function (menuItemsTitleHtml){
                //retrieve single category snippet
                $ajaxUtils.sendGetRequest(
                    menuItemHtml, function (menuItemHtml){
                        var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml ); //to make the page using snippets
                        insertHtml("#main-content", menuItemsViewHtml);
                    },false
                );
            },false
        );
    }

    /* using categories data and snippets html build categories view html to be inserted into paga */
    function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml){
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);

        var finalHtml = menuItemsTitleHtml;
        finalHtml += "<section class='row'>";

        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;
        //loop over categories
        for(var i = 0 ; i< menuItems.length; i++){
            //insert category values
            var html = menuItemHtml;
            html = insertProperty(html, "short_name",menuItems[i].short_name);
            html = insertProperty(html, "catShortName",catShortName);
            html = insertItemPrice(html, "price_small",menuItems[i].price_small);
            html = insertItemPortionName(html, "small_portion_name",menuItems[i].small_portion_name);
            html = insertItemPrice(html, "price_large",menuItems[i].price_large);
            html = insertItemPortionName(html, "large_portion_name",menuItems[i].large_portion_name);
            html = insertProperty(html, "name",menuItems[i].name);
            html = insertProperty(html, "description",menuItems[i].description);
            if(i%2 != 0){
                html +="<div class='clearfix visible-lg-block visible-md-block'></div>"
            }
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    function insertItemPrice (html, pricePropName, priceValue){
        //if not specified return empty
        if(!priceValue){
            return insertProperty(htm, pricePropName, "");
        }
        
        priceValue = "$" + priceValue.toFixed(2);
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }

    // Appends portion name in parens if it exists
        function insertItemPortionName(html, portionPropName, portionValue) {
        // If not specified, return original string
        if (!portionValue) {
            return insertProperty(html, portionPropName, "");
        }

        portionValue = "(" + portionValue + ")";
        html = insertProperty(html, portionPropName, portionValue);
        return html;
    }

    global.$dc = dc;
})(window);