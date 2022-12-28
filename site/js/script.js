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
    // On page load (before images or CSS)
    document.addEventListener("DOMContentLoaded", function (event){
        // On first load, show home view
        showLoading("#main-content");
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
        $ajaxUtils.sendGetRequest(
            allCategoriesUrl, buildAndShowCategoriesHTML);
    };
    /* Builds HTML for the categories page based on the data from the server */
    function buildAndShowCategoriesHTML(categories){
        //load title snippet of categories page
        $ajaxUtils.sendGetRequest(
            categoriesTitleHtml, function (categoriesTitleHtml){
                //retrieve single category snippet
                $ajaxUtils.sendGetRequest(
                    categoryHtml, function (categoryHtml){
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
            var shortName = categories[i].short_name;
            html = insertProperty(html, "name", name);
            html = insertProperty(html, "short_name",short_name);
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }


    global.$dc = dc;
})(window);