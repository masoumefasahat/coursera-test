$(function () {
    $("#navbarToggle").blur(function (event){
        var screenWidth = window.innerWidth;
        console.log("here");
        if(screenWidth < 768){
            $("#collapsable-nav").collapse('hide');
            
        }
    });
});

( function (global){

    var dc = {};
    var homeHtml = "snippets/home-snippet.html";

    var insertHtml = function (selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };

    var showLoading = function(selector){
        var html = "<div class='test-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHtml(selector, html);
    };

    document.addEventListener("DOMContentLoaded", function (event){
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            homeHtml,
            function (responseText) {
                document.querySelector("#main-content").innerHTML = responseText;
            },
            false);
    });

    global.$dc = dc;
})(window);