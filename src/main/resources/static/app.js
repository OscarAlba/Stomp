/* global getMousePosition, addPointToCanvas, connectAndSubscribe, addPolygonToCanvas */

var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var identifier = null;
    
    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
//        stompClient.send("/topic/newpoint", {}, JSON.stringify({x:point.x,y:point.y}));
    };
    
     var addPolygonToCanvas = function (points) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        console.log("POLO--->" +points);
        for (i in points){
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.fill();
    };
    
    
    var getMousePosition = function (evt) {
       
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    
    };


    var connectAndSubscribe = function (id) {
        
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+identifier, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                //alert("Punto : X "+theObject.x+" Y "+theObject.y);
                addPointToCanvas(theObject);
            });
            
            stompClient.subscribe('/topic/newpolygon.'+identifier, function (eventbody){
                var polygon = JSON.parse(eventbody.body);
                addPolygonToCanvas(polygon);
            });
            
            
        });

    };
    
    

    return {

        init: function (id) {
            identifier = id;
            var can = document.getElementById("canvas");
            //can.addEventListener("click",getMousePosition());
            $(can).click( function (e){
                var pt = getMousePosition(e);
                console.info("publishing point at " + pt) ;
                stompClient.send("/app/newpoint."+identifier, {}, JSON.stringify(pt));
            });
//            websocket connection
            
            connectAndSubscribe(id);
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at Point"+ pt);
            addPointToCanvas(pt);
//            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt)); 
        
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();