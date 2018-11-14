/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author 2106991
 */

@Controller
public class STOMPMessagesHandler {
    @Autowired
	SimpMessagingTemplate msgt;
        
        ConcurrentHashMap<String, CopyOnWriteArrayList<Point>> points = new ConcurrentHashMap<>();
    
	@MessageMapping("/newpoint.{numdibujo}") 
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
            
            msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
            
            if (points.containsKey(numdibujo)){
                points.get(numdibujo).add(pt);
                if (points.get(numdibujo).size() >= 4){
                    msgt.convertAndSend("/topic/newpolygon."+numdibujo, points.get(numdibujo));
                    points.put(numdibujo, new CopyOnWriteArrayList<>());
                }
            }else{
                CopyOnWriteArrayList<Point> point = new CopyOnWriteArrayList<>();
                point.add(pt);
                points.put(numdibujo, point);
            }
            System.out.println("Nuevo punto recibido en el servidor!:"+pt);
	}
}
