var menuButton=document.querySelector(".menu__icon"),subMenu=document.querySelector(".menu__sub");window.addEventListener("load",function(){subMenu&&(subMenu.style.height="0px",subMenu.style.visibility="hidden",menuButton.addEventListener("click",function(e){e.preventDefault(),"0px"===subMenu.style.height?(subMenu.style.height="160px",subMenu.style.visibility="visible"):(subMenu.style.height="0px",subMenu.style.visibility="hidden")}));var e=document.querySelector(".people__add"),t=document.querySelector(".people__sub");t&&(t.style.top="-50px",e.addEventListener("click",function(e){e.preventDefault(),"-50px"===t.style.top?t.style.top="33px":t.style.top="-50px"}));var i=document.querySelector(".modal"),n=document.getElementsByClassName("create-project"),l=document.querySelector(".modal__content__close");i.style.opacity="0",i.style.visibility="hidden";for(var u=0;u<n.length;u++)n[u].addEventListener("click",function(e){e.preventDefault(),i.style.opacity="1",i.style.visibility="visible"});l.addEventListener("click",function(){i.style.opacity="0",i.style.visibility="hidden"})});