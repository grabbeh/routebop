
function imageController(){
    var that = this;
    images = [];

    this.init = function(){
      $('#MyForm').transloadit(imageCtrl.transloaditOptions);
      this.addRemoveImageHandler();
      this.togglePlacesandImages();
      this.triggerUploadProcessHandler();
    }

    this.updateImages = function(id){
        if (this.returnImages().length === 1){
           images = [];
        }
        else {
          images.splice(id, 1);
      }
    }

    this.returnImages = function(){
       return images;
    }

    this.removeImage = function(e){
        e.preventDefault();
        var id = $(this).index();
        that.updateImages(id);
        $(this).parent().remove();
    }

    this.triggerUploadProcessHandler = function(){
      $('#fileupload').on('change', function(){
          $('#photoUpload').click();
        });
    }

    this.addRemoveImageHandler = function(elem) {
        $(elem).click(that.removeImage);
    }

    this.togglePlacesandImages = function(){
        $('#imageUploadButton').click(that.toggleToImagesButton)
        $('#placesbutton').click(that.toggleToPlacesButton)
    }

    this.toggleToImagesButton = function(){
        if($('#newcontentparent').is(':visible')){
             $('#imageUploadButton').addClass('bold');
             $('#imageUploadBox').removeClass('hidden')
             $('#imageUploadBox').addClass('active');
             $('#newcontentparent').removeClass('active');
             $('#placesbutton').removeClass('bold');
             $('#newcontentparent').addClass('hidden');
         }
     }

     this.toggleToPlacesButton = function(){
        if($('#imageUploadBox').is(':visible')){
             $('#placesbutton').addClass('bold');
             $('#newcontentparent').removeClass('hidden')
             $('#newcontentparent').addClass('active');
             $('#imageUploadBox').removeClass('active');
             $('#imageUploadButton').removeClass('bold');
             $('#imageUploadBox').addClass('hidden');
         }
     }

    this.transloaditOptions = {

           wait: true,
           autoSubmit: false,
           modal: false,
           onProgress: function(bytesReceived, bytesExpected){
             var result = bytesReceived / bytesExpected;
             if (result !== NaN) {
             $('#progress').text("Progress: " + (bytesReceived / bytesExpected * 100).toFixed(2)+'%');
           }
           },
           onSuccess: function(assembly){
            $('#progress').text("");
             var turl = assembly.results.thumb[0].url;
             var thumburl = turl.replace('http', 'https');
             var murl = assembly.results[':original'][0].url;
             var mainurl = murl.replace('http', 'https');
             $('#thumb').append("<a href=" + mainurl + ">" + "<img src=" + thumburl + "><span>x</span></a>");
             $('#thumb').find('span').addClass('removeImage');
             var imgUrls = {};
             imgUrls['thumburl'] = thumburl;
             imgUrls['mainurl'] = mainurl;
             images.push(imgUrls);
           
        }


    }
}


