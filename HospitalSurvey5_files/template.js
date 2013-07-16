function focusFirst(Event)
{
	$('#limesurvey :input:visible:enabled:first').focus();
	
}
/*
 * The focusFirst function is added to the eventlistener, when the page is loaded.
 * 
 * This can be used to start other functions on pageload as well. Just put it inside the 'ready' function block
 */

 var a=0;

 
 $(document).ready(function(){ 

// Code chnaged by DS on 24th March 2012
// Disable Ajax data-ajax="false"
 $.mobile.ajaxEnabled = false;
 $.mobile.ajaxLinksEnabled = false;

var temp = document.getElementById("fieldnames").value;

/* Added by DS on 09-07-12 to Multiple inputs work*/
/* var mySplitResult = temp.split("|"); */

var mySplitResult = [];
var questionType = [];


$("div[data-role='page']").each(function(index, domEle){
  
   mySplitResult.push(this.id); 
   
   /* Get the type of question 1 = radio, 2 = Multi-op */
   if($(domEle).attr("QClass") == "list-radio" ) {
      questionType.push(1);
   }
   else if ($(domEle).attr("QClass") == "multiple-opt") {
       questionType.push(2);
   }
    
});


/* Hide the image for the question having multiple-options */
$("div[QClassImgDiv='multiple-opt']").hide();

/* This is to hide no option button */
 $("input[id*='NANS']").parent().hide(); 


/* Add the two column layout */
$("div[QClassAnsDiv='multiple-opt']").attr("class", "ui-grid-a");

/* Move the Multiple Choice List to left */
$("div[QClassAnsDiv='multiple-opt']").css({"float": "center","width": "90%" ,"line-height": "80%" , 'margin-right': '0%', "font-size": "95%" });


/*  Update the the layout for Multi- */
 $("div[id='qGrid'][GClass='multiple-opt']").css({'min-height': '475px'});


/* Assign layouts to two column grids */
$("ul[class='cols-2-ul first']").attr("class", "ui-block-a");
$("ul[class='cols-2-ul last']").attr("class", "ui-block-b").css("margin-left", "0px"); 


/* Event handler for main-page handling*/
$('input[id*=answer][type=radio]').on('change', {pageJump : 2},  movePageWithDelay); 

/* Event handler for Multi-page default handling */
$('input[type=checkbox]').on('change', {pageJump : 1},  movePageMultChoice); 


/* Hide Previous button */
$('input[name=Previous]').parent().css({'display': 'none'});


/* Event handler for Previous buttong */
$('input[name=Previous]').on('click', prevPage);
$('input[name=Next]').on('click', nextPage);
$('input[name=Restart]').on('click', goToFirstPage);

/* Set the colours for Buttons in radio*/
$("input[id*='A1']").attr("data-theme","b");
$("input[id*='A2']").attr("data-theme","a");
$("input[id*='A3']").attr("data-theme","e");

/* Set the colours for Buttons in Checkbox*/
$("input[id*='SQ']").attr("data-theme","e");

$("label[for*='SQ']").css({'min-height': '150px', 'font-size':'30px'});


/* Set the height of buttons, this also changes the height of screen*/
$("div[qclassansdiv='list-radio']").css({'line-height': '40px'});

$("div[gclass='multiple-opt']").css({'min-height': '490px'});
$('input[name=AgeGroup]').on('click', {delay : 3000}, moveFirstPage);

/* when comment button pressed, move to comment page */
$('ansThankUYesA1').on('change', {pageJump : 2},  showCommentPage);
$('input[id*=ansThankUYes][type=radio]').on('change', {pageJump : 2},  showCommentPage); 
 
/* for webdemo */
$("div[qclass='list-radio']").css({'background':'none', 'background-image':'url(./HospitalSurvey5_files/background.png)', 'background-repeat': 'no-repeat' ,'width':'1200px','height':'600px'});
$("div[qclass='multiple-opt']").css({'background':'none', 'background-image':'url(./HospitalSurvey5_files/background.png)', 'background-repeat': 'no-repeat', 'width':'1200px','height':'600px'});

$('div[id=qGrid]').parent().css({'margin-top': '4%', 'width':'84%'});
$('div[id=testid]').css({'width':'85%'});



/* Handling of previous buttong */
function prevPage(event){

	clearTimeout(tmrId)
	var cId =  event.target.id;
	var nxt=a-1 ;	
	var nextid="#"+mySplitResult[nxt];
     a = nxt;
	$.mobile.changePage($(nextid), { transition: "slide"} 		 );

}


/* Function to navigat to next page */
function movePage(event){

        /* Submit the form if it is end page */	
	//var pJump  = event.data.pageJump ;
	
	var cId =  event.target.id;
	var pJump = getJump(cId );

/* Stop further propogation of event */
	event.stopPropagation();

/* Submit present and start time */	

	if(a==0) {
		$("input[id='tm1']").attr("value", new Date().getTime());
	}
	if(a==1) {
		$("input[id='tm2']").attr("value", new Date().getTime());
	}
 /* Submit present and start time */		
	
	var nxt=a+pJump ;	
		 
	if(nxt>=mySplitResult.length){
		/* document.forms["limesurvey"].submit(); */
		$("input[id='tm3']").attr("value", new Date().getTime());
           saveXML();
		return;
	}
		
	var nextid="#"+mySplitResult[nxt];
	
	a = nxt;
	
	 $.mobile.changePage($(nextid), { transition: "slide", delay : "3000"} 
		 );
		
	}

function getJump(jId) {

         /*  If  this is last page return */
        if(a>=mySplitResult.length-1){
		return 1;
	}
	
	/* if next page is Main Question, go to that page */
	if (questionType[a+1] == 1){
		return 1;
	} 
	
	/* If  last button clicked, go to sub question page (Next page) */
	if(jId.indexOf("A3")>0) {
    	return 1;
    	} else if (jId.indexOf("A2")>0){
      return 1;
     } 
	else  {
    	
    	  /* TODO - Check that there are not more multiple pages */
    	  /* TODO - Check this for Next button as well */
    	  return 2;
    	} 
    	
    	/*  By default return next page */
    	return 1;
  	
}



/* Function to submit the question */
var isWaitPeriodOver = 1;
var tmrId = 0;
function movePageMultChoice(event) {

    /* Clear the timer previously set */
    /* TODO - Check the events are fired from same page */
        clearTimeout(tmrId);
   
    /* If waiting period is over move the page */
    if ( isWaitPeriodOver == 1 ) {
        
    	// Remove timer function
	tmrId = setTimeout(function(){movePage(event)}, 2500);
	//movePage(event);

    }    
}

/* Function to move from first page */
function moveFirstPage(event) {

    /* Clear the timer previously set */
    /* TODO - Check the events are fired from same page */
 
        
    	// Remove timer function
	 setTimeout(function(){movePage(event)}, 250	);

    
}


/* Handling of previous buttong */
function nextPage(event){
  clearTimeout(tmrId)
  movePage(event);
}    


/* Handling of Restart button */
function goToFirstPage(event){
  clearTimeout(tmrId)
  a=1;
  var firstid="#"+mySplitResult[1];
  $.mobile.changePage($(firstid), { transition: "slide", delay : "20"} );

}    


/* Saving XML */
function saveXML() {
     
	var xmlContent;
	var xmlContent = "<data> ";
      $('body').find('input[type=hidden]').each(function(){
	 	xmlContent= xmlContent+ "<" + $(this).attr("name") + ">" + $(this).attr("value") + "</" + $(this).attr("name") + ">" + "\n";

     })
     xmlContent = xmlContent + " </data>";
     

     xmlContent = xmlContent + "\n" + "<info> ";
      $('body').find("input[id*='qf_ui_'][type='text']").each(function(){
	 	xmlContent= xmlContent+ "<" + $(this).attr("name") + ">" + $(this).attr("value") + "</" + $(this).attr("name") + ">" + "\n";

     })
	$('body').find("input[id*='qf_ui_']:checked").each(function(){
	 	xmlContent= xmlContent+ "<" + $(this).attr("name") + ">" + $(this).attr("value") + "</" + $(this).attr("name") + ">" + "\n";
     })

	xmlContent = xmlContent + " </info>";
//     alert(xmlContent)


//	window.location.href = "/webdemo.php?key=xyz&pid=1";
location.assign('index.htm');

	return true;
	
}


/* Handling Move to comment page */
function showCommentPage(event){
	saveXML();


}


/* Set timeout for this page */
setTimeout(function(){resetPage()}, 500000);

function resetPage(){
	window.location.href = "webdemo.php?key=xhdyketrek76&pid=1";

}


/* Move page with some delay */


/* Function to move from first page */
function movePageWithDelay(event) {

    	// Remove timer function
	 setTimeout(function(){movePage(event)}, 250	);   
}


$('#qf_ui_patientId').keyboard({
     layout : 'num',
     restrictInput : true, 
     preventPaste : true,  
     autoAccept : true
    }).addTyping();


});