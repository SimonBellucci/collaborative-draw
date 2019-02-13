
// Ouverture du menu
var menuButton = document.querySelector(".menu__icon");
var subMenu = document.querySelector(".menu__sub");

window.addEventListener("load" , function() {

    if (subMenu) {

        subMenu.style.height = "0px";
        subMenu.style.visibility = "hidden";

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

    // ouverture des utilisateurs à ajouter
    var addButton = document.querySelector(".people__add");
    var subAdd = document.querySelector(".people__sub");



    if (subAdd) {

        subAdd.style.top = "-50px";

        addButton.addEventListener('click' , function(e) {
            e.preventDefault();
            if (subAdd.style.top  === "-50px") {
                subAdd.style.top = "33px";
            }
            else {
                subAdd.style.top = "-50px";
            }
        });
    }



    //ouverture modal créer un projets
    var modal = document.querySelector('.modal');
    var btnCreate = document.getElementsByClassName('create-project');
    var closeModal = document.querySelector('.modal__content__close');


    modal.style.opacity = "0";
    modal.style.visibility = "hidden";

    for (var i = 0 ; i < btnCreate.length ; i++) {
        btnCreate[i].addEventListener('click' , function(e) {
            e.preventDefault();

            modal.style.opacity = "1";
            modal.style.visibility = "visible";
        });
    }
    closeModal.addEventListener('click' , function() {
        modal.style.opacity = "0";
        modal.style.visibility = "hidden";
    });
});
