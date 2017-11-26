$(document).ready(showContent);

var courseidReceived;

var apiURL = "http://localhost:3000";
var httpURL = "http://localhost:8080";

var cardTemplate = $("#scrollable-template").detach();

function showContent(){
    populateContent();
}

var populateContent = function() {
    courseidReceived = window.localStorage.getItem('objectToPass');
    //window.localStorage.removeItem( 'objectToPass' ); // Clear the localStorage
    $(".scrollable-content").html="";
 var settings = {
    "async": true,
    "crossDomain": true,
    "url": apiURL +  "/course/" + courseidReceived,
    "method": "GET",
    "headers": {
    "cache-control": "no-cache",
    "postman-token": "7db05a42-996e-d4ce-22a5-1f780fe6e89e"
  }
}

$.ajax(settings).done(function (response) {
  //console.log(response);
    for(var i=0; i<response[0].content.length; i++)
        {
            var curItem = cardTemplate.clone();
            curItem.find(".content-desc").html(response[0].content[i].contentdesc);
            curItem.find(".content-link").html(response[0].content[i].link);
            curItem.find("#content-num").html(""+(i+1));
            $(".scrollable-content").append(curItem.clone());  
        }
});
}

function addCourse_submit(obj) {
    var submitid = $(obj).attr("id");
    var text="", img="", link="";
    var M="00",m="00",d="00",h="00";
    var timediff;
    switch(submitid){
            case("text-submit"):
                text = $(obj).siblings("div.half").children(".text-field")[0].value;
                alert("Text Entered: " + text);
                document.getElementsByClassName("cf")[0].submit(); //form submission
                alert($(obj).siblings("div.timediff").find('#minutes').val());
                timediff = {
                    "months":$(obj).siblings("div.timediff").find('#months').val(),
                    "days":$(obj).siblings("div.timediff").find('#days').val(),
                    "hours":$(obj).siblings("div.timediff").find('#hours').val(),
                    "minutes":$(obj).siblings("div.timediff").find('#minutes').val
                };
                
                break;
            
            case("link-submit"):
                link= $(obj).siblings("div.half").children(".link-field")[0].value;
                document.getElementsByClassName("cf")[1].submit(); //form submission
                timediff = {
                    "months":$(obj).siblings("div.timediff").find('#months').val(),
                    "days":$(obj).siblings("div.timediff").find('#days').val(),
                    "hours":$(obj).siblings("div.timediff").find('#hours').val(),
                    "minutes":$(obj).siblings("div.timediff").find('#minutes').val
                };
                break;
            
            case("image-submit"):
                text = $(obj).siblings("div.half").children(".text-field")[0].value;
                img = $(obj).siblings("div.half").children(".image-field")[0].value;
                document.getElementsByClassName("cf")[2].submit(); //form submission
                timediff = {
                    "months":$(obj).siblings("div.timediff").find('#months').val(),
                    "days":$(obj).siblings("div.timediff").find('#days').val(),
                    "hours":$(obj).siblings("div.timediff").find('#hours').val(),
                    "minutes":$(obj).siblings("div.timediff").find('#minutes').val
                };
                break;
            
            case("quiz-submit"):
                text = $(obj).siblings("div.half").children(".text-field")[0].value;
                img = $(obj).siblings("div.half").children(".image-field")[0].value;
                link= $(obj).siblings("div.half").children(".link-field")[0].value;
                document.getElementsByClassName("cf")[3].submit(); //form submission
                timediff = {
                    "months":$(obj).siblings("div.timediff").find('#months').val(),
                    "days":$(obj).siblings("div.timediff").find('#days').val(),
                    "hours":$(obj).siblings("div.timediff").find('#hours').val(),
                    "minutes":$(obj).siblings("div.timediff").find('#minutes').val
                };
                break;
    }
    //var desc = document.getElementById("input-desc").value;
    //var link = document.getElementById("input-link").value;
    
    var newcontent ={"courseid":courseidReceived,"contentdesc":text,"link":link, "imageurl":img, "timediff":timediff};
    alert("Months in Newcontent = " + newcontent.timediff.months);
    var settings2 = {
        "async": true,
        "crossDomain": true,
        "url": apiURL + "/content/update",
        "method": "POST",
        "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache",
        "postman-token": "42af6581-3ab2-712b-9270-92f8631edcee"
      },
      "data": {
        "body": JSON.stringify(newcontent)
      }
    }

    $.ajax(settings2).done(function (response) {
    $(".scrollable-content").html="";
        window.localStorage.setItem( 'objectToPass', courseidReceived);
        //window.location.href = "http://localhost:8080/dashboard";
        populateContent();
    }); 
}

function headerClicked(type){
    switch(type){
            
        case "Text":
            $('#text-form').attr("hidden",false);
            $('#link-form').attr("hidden",true);
            $('#image-form').attr("hidden",true);
            $('#quiz-form').attr("hidden",true);
            
            $('#text-li').attr("class","post-active");
            $('#link-li').attr("class","post-deactive");
            $('#image-li').attr("class","post-deactive");
            $('#quiz-li').attr("class","post-deactive");
            break;
            
        case "Link":
            $('#text-form').attr("hidden",true);
            $('#link-form').attr("hidden",false);
            $('#image-form').attr("hidden",true);
            $('#quiz-form').attr("hidden",true);
            
            $('#text-li').attr("class","post-deactive");
            $('#link-li').attr("class","post-active");
            $('#image-li').attr("class","post-deactive");
            $('#quiz-li').attr("class","post-deactive");
            break;
            
        case "Image":
            $('#text-form').attr("hidden",true);
            $('#link-form').attr("hidden",true);
            $('#image-form').attr("hidden",false);
            $('#quiz-form').attr("hidden",true);
            
            $('#text-li').attr("class","post-deactive");
            $('#link-li').attr("class","post-deactive");
            $('#image-li').attr("class","post-active");
            $('#quiz-li').attr("class","post-deactive");
            break;
            
        case "Quiz":
            $('#text-form').attr("hidden",true);
            $('#link-form').attr("hidden",true);
            $('#image-form').attr("hidden",true);
            $('#quiz-form').attr("hidden",false);
            
            $('#text-li').attr("class","post-deactive");
            $('#link-li').attr("class","post-deactive");
            $('#image-li').attr("class","post-deactive");
            $('#quiz-li').attr("class","post-active");
            break;
    }
}

