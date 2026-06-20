package org.example.backendrestobarlasolas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaRedirectController {

    @GetMapping(value = {
        "",
        "/",
        "/login",
        "/register",
        "/cocina",
        "/menu",
        "/carrito",
        "/checkout",
        "/seguimiento/**",
        "/admin/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
