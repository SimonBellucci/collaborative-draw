circleButton.addEventListener('click', function() {


  var circle = new fabric.Circle({
    radius: 100,
    fill: color,
    left: canvas.width/2,
    top: canvas.height/2,
    id: count
  });

  canvas.add(circle);
  count++

  circle.on('moving', function() {
    newTop = circle.top;
    newLeft = circle.left;
    socket.emit('newCoords', {top: newTop, left: newLeft, id: circle.id});
  });

  //Serialization
  var serializedCanvas = JSON.stringify(canvas);
  socket.emit('connectionCanvas', serializedCanvas);

});
