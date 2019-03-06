
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
                subMenu.style.height = "213px";
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

    var modalVisibility = document.querySelector('.modal-visibility');
    var btnVisibility = document.querySelector('.project__preview__status');
    var closeModalVisibility = document.querySelector('.modal-visibility__content__close');
    var btnValidationVisibility = document.querySelector('.modal-visibility__content__validate')

    if (modalVisibility) {
        hiddenModal(modalVisibility)

        btnVisibility.addEventListener('click' , function(e) {
            e.preventDefault();
            modalVisibility.style.opacity = "1";
            modalVisibility.style.visibility = "visible";
        });

        closeModalVisibility.addEventListener('click' , function() {
            hiddenModal(modalVisibility)
        });
        btnValidationVisibility.addEventListener('click' , function() {
            hiddenModal(modalVisibility)
        });
        modalVisibility.addEventListener('click' , function(e) {
            if(e.target ==  modalVisibility) {
                hiddenModal(modalVisibility)
            }
        });
    }

});
