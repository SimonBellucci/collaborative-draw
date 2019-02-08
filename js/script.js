
// Ouverture du menu
var menuButton = document.querySelector(".menu__icon");
var subMenu = document.querySelector(".menu__sub");

window.addEventListener("load" , function() {

    subMenu.style.height = "0px";
    subMenu.style.visibility = "hidden";

    if (subMenu) {
        menuButton.addEventListener('click' , function(e) {
            e.preventDefault();
            if (subMenu.style.height  === "0px") {
                subMenu.style.height = "160px";
                subMenu.style.visibility = "visible";
            }
            else {
                subMenu.style.height = "0px";
                subMenu.style.visibility = "hidden";
            }
        });
    }
});
