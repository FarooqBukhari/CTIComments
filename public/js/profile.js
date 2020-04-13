$(document).ready(function(){

    //Tab toggling
    $(".dashboard").show();
    $(".card").hide();
    //-- Click on detail or Specs
    $(".sidebar > a").on("click",function(){
        $(".sidebar > a").removeClass("active");
        $(this).addClass("active");
        if($(".dash").hasClass("active")){
            $(".dashboard").show();
            $(".card").hide();
        }   
        else if($(".notifications").hasClass("active")){
            $(".dashboard").hide();
            $(".card").show();
        } 
    })                    
});