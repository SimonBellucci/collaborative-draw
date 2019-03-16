
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
                subMenu.style.height = "165px";
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
                document.querySelector('.people__sub__input').focus()
                subAdd.style.top = "53px";
            }
            else {
                subAdd.style.top = "-50px";
            }
        });

        // subAdd.addEventListener("blur" , function(e) {
        //     e.target.closest(".people__sub").style.top = "-50px"
        // }, true);
    }


    //ouverture modal créer un projets

    function hiddenModal(typeModal) {
        typeModal.style.opacity = "0";
        typeModal.style.visibility = "hidden";
    }

    var modal = document.querySelector('.modal');
    var btnCreate = document.getElementsByClassName('create-project');
    var closeModal = document.querySelector('.modal__content__close');

    if (modal) {

        hiddenModal(modal)

        for (var i = 0 ; i < btnCreate.length ; i++) {
            btnCreate[i].addEventListener('click' , function(e) {
                e.preventDefault();
                modal.style.opacity = "1";
                modal.style.visibility = "visible";
            });
        }
        
        closeModal.addEventListener('click' , function() {
            hiddenModal(modal)
        });

        modal.addEventListener('click' , function(e) {
            if(e.target ==  modal) {
                hiddenModal(modal)
            }
        });
    }


    // animation like
    var like = document.getElementsByClassName('popular-projects__three__box-infos__like__icon');

    for (var i = 0 ; i < like.length ; i++) {

        like[i].addEventListener('click' , function() {
            this.classList.toggle("popular-projects__three__box-infos__like__icon--is-animate")
        })

        like[i].addEventListener('webkitAnimationEnd' , function() {
            this.classList.add("popular-projects__three__box-infos__like__icon--is-animate")
        })
    }


    var headerChat = document.querySelector('.chat__header');
    var chat = document.querySelector('.chat');

    if (headerChat) {
        headerChat.addEventListener('click' , function() {
           chat.classList.toggle('open');
        });
    }


    // notifications

    var popup = document.getElementsByClassName('popup');
    var popupClose = document.getElementsByClassName('popup__close');


    if (popup) {
        for (var i = 0 ; i < popup.length ; i++) {


            function openNotif() {
                popup[i].classList.add('open');
            }

            function closeNotif() {
                popup[i].classList.remove('open');
            }

            popupClose[i].addEventListener('click' , function() {
                closeNotif()
            });
        }
    }


    // visibilité du projets

    var modalVisibility = document.getElementsByClassName('modal-visibility');
    var btnVisibility = document.getElementsByClassName('project__preview__status');
    var closeModalVisibility = document.querySelectorAll('.modal-visibility__content__close');
    var btnValidationVisibility = document.querySelectorAll('.modal-visibility__content__validate')

    if (modalVisibility){
        for (var i = 0; i < modalVisibility.length; i++){

            var id = modalVisibility[i].getAttribute('id');

            document.getElementById(id).style.opacity = "0";
            document.getElementById(id).style.visiility = "hidden";

            btnVisibility[i].addEventListener('click' , function(e) {
                e.preventDefault();
                document.getElementById(id).style.opacity = "1";
                document.getElementById(id).style.visibility = "visible";
            });

            closeModalVisibility[i].addEventListener('click' , function() {
                document.getElementById(id).style.opacity = "0";
                document.getElementById(id).style.visibility = "hidden";
            });

            btnValidationVisibility[i].addEventListener('click' , function() {
                document.getElementById(id).style.opacity = "0";
                document.getElementById(id).style.visibility = "hidden";
            });

            modalVisibility[id].addEventListener('click' , function(e) {
                console.log(e);
                if (e.target ==  modalVisibility[id]) {
                    document.getElementById(id).style.opacity = "0";
                    document.getElementById(id).style.visibility = "hidden";
                }
            });
        }
    }

    var characteristics = document.querySelector('.characteristics');
    var openClose = document.querySelector('.characteristics__close')

    if (characteristics) {
        openClose.addEventListener('click' , function() {
           characteristics.classList.toggle('active');
           this.classList.toggle('active');
        });
    }


    // afficher la grille
    var gridShow = document.getElementById('grid-canvas')
    var canvasContainer = document.querySelector('.canvas-container')

    if(gridShow) {
        gridShow.addEventListener('change' , function() {
            if (gridShow.checked == true) {
                console.log('true')
                canvasContainer.classList.add('active');
            }
            else if (gridShow.checked == false){
                console.log('false')
                canvasContainer.classList.remove('active');
            }
        });
    }

});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init();
});
