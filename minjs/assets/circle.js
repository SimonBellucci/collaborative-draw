circleButton.addEventListener("click",function(){var n=new fabric.Circle({radius:100,fill:color,left:canvas.width/2,top:canvas.height/2,id:count});canvas.add(n),count++,n.on("moving",function(){newTop=n.top,newLeft=n.left,socket.emit("newCoords",{top:newTop,left:newLeft,id:n.id})});var t=JSON.stringify(canvas);socket.emit("connectionCanvas",t)});