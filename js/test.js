var demo = document.getElementById('demo');
var btn = document.getElementById('dateBtn');

btn.addEventListener('click', function() {
    demo.innerHTML=Date();
});