var timeoutHandler;
var myDropzone;

var init_dropzone = function() {
    myDropzone = new Dropzone('div#img-upload', { // Make the whole body a dropzone
        url: uploadLocation, // Set the url
        autoQueue: true, // Make sure the files aren't queued until manually added
        acceptedFiles: "image/png,image/jpg,image/jpeg,application/pdf,video/mp4",
        previewsContainer: ".inner-text",
        thumbnailWidth: 280,
        thumbnailHeight: 280,
        thumbnailMethod: "contain",
        maxFiles: 1
    });

    myDropzone.on("addedfile", function(file) {
        $('#imageUrl').val('');
        $('.dz-image-preview').remove();
        $('div#textIndicator').hide();
        $('.dz-image').siblings().hide();
        $('.dz-image > img').addClass('img-responsive');
        $('#imageData').attr('data-attr-filename', file.name);
        var reader = new FileReader();
        reader.onload = function(e) { 
            $('#imageData').val(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    myDropzone.on("drop", function(file){
        myDropzone.removeAllFiles(true);
    });

    myDropzone.on("success", function(file, response, progress_event) {
        resp = JSON.parse(response);
        displayMessage(resp.status, resp.message);
    });    
};

var init_transactions = function(page, perPage) {
    var urlTransaction = transactionsLocation+'?start='+page+'&length='+perPage;
    busyIndicator(true);
    do_request('GET', urlTransaction, null, function(data) {
        var list = data.data;
        var totalItems = data.range.total;
        var pages = Math.ceil(totalItems/data.range.length);
        var thumbnailParent = $('#transactionHistory div.transaction-body');
        var paginationEl = $('ul.pagination');
        var disabled = '';

        thumbnailParent.html(''); //we remove the current content of the thumbnail

        //display the fecth history in the thumbnail container
        for (var x = 0 in list) {
            var imgUrl = baseImgUrl.replace('transid',list[x].trans_id);
            thumbnailParent.append('<div class="transaction-item col-sm-2 float-left"><img id="prevTrans" class="img-fluid mx-auto d-block" src="'+imgUrl+'" alt="'+list[x].fname+'" list-attr-presence="'+list[x].result.presence+'" list-attr-count="'+list[x].result.count+'"></div>');
        }

        //bind click event on the images for diplay
        thumbnailParent.on('click', 'img#prevTrans', function(e){
            e.preventDefault();
            e.stopPropagation();
            preloadImage($(this).attr('alt'), $(this).attr('src'));
            $('h1#presence').html($(this).attr('data-attr-presence'));
            $('h1#count').html($(this).attr('data-attr-count'));
        });

        //contruct pagination
        paginationEl.html('');
        for (var x = 0; x<pages; x++) {
            var active = (((x*data.range.length))==page) ? 'active' : '';
            paginationEl.append('<li class="page-item '+active+'"><a class="page-link" href="#" data-attr-start="'+(x*data.range.length)+'" data-attr-length="'+data.range.length+'">'+(x+1)+'</a></li>');
        }
        
        disabled = (page == 0) ? 'disabled' : '';
        paginationEl.prepend('<li class="page-item '+disabled+'"><a class="page-link" href="#" aria-label="Previous" data-attr-start="'+(page-data.range.length)+'" data-attr-length="'+data.range.length+'"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></a></li>');

        disabled = (page == pages) ? 'disabled' : '';
        paginationEl.append('<li class="page-item '+disabled+'"><a class="page-link" href="#" aria-label="Next" data-attr-start="'+(page+data.range.length)+'" data-attr-length="'+data.range.length+'"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>');


        paginationEl.on('click', 'a.page-link', function(e){
            e.preventDefault();
            e.stopPropagation();
            init_transactions($(this).attr('data-attr-start'), $(this).attr('data-attr-length'));
        });
        busyIndicator(false);
        // var carouselEl = $('#previousCarousel');
        // var slidesParent = $('#previousCarousel > div.carousel-inner');

        // carouselEl.carousel("pause").removeData();
        // slidesParent.html('');
        // for (var x = 0 in data) {
        //     var imgUrl = baseImgUrl.replace('transid',data[x].trans_id)
        //     slidesParent.append('<div class="carousel-item col-md-2"><img id="prevTrans" class="img-fluid mx-auto d-block" src="'+imgUrl+'" alt="'+data[x].fname+'" data-attr-presence="'+data[x].result.presence+'" data-attr-count="'+data[x].result.count+'"></div>');
        // }

        // slidesParent.children('div:nth(0)').addClass('active');
        // carouselEl.carousel(0);

        // carouselEl.on('slide.bs.carousel', function (e) {
        //     var $e = $(e.relatedTarget);
        //     var idx = $e.index();
        //     var itemsPerSlide = 6;
        //     var totalItems = $('.carousel-item').length;
            
        //     if (idx >= totalItems-(itemsPerSlide-1)) {
        //         var it = itemsPerSlide - (totalItems - idx);
        //         for (var i=0; i<it; i++) {
        //             // append slides to end
        //             if (e.direction=="left") {
        //                 $('.carousel-item').eq(i).appendTo('.carousel-inner');
        //             }
        //             else {
        //                 $('.carousel-item').eq(0).appendTo('.carousel-inner');
        //             }
        //         }
        //     }
        // }); 

        // if ($('.carousel-item').length > 0) {
        //     $('#deleteHistory').show();
        // } else {
        //     $('#deleteHistory').hide();
        // }

        // slidesParent.on('click', 'img#prevTrans', function(e){
        //     e.preventDefault();
        //     e.stopPropagation();
        //     preloadImage($(this).attr('alt'), $(this).attr('src'));
        //     $('h1#presence').html($(this).attr('data-attr-presence'));
        //     $('h1#count').html($(this).attr('data-attr-count'));
        // });

    }, function(error) {
        displayMessage('error', 'Unable to retrieve previous transactions');
        busyIndicator(false);
    });
}

function preloadImage (filename, url, size = 12345) {
    $('.dz-image-preview').remove();
    var mockFile = {name: filename, size: size};
    myDropzone.options.addedfile.call(myDropzone, mockFile);
    myDropzone.options.thumbnail.call(myDropzone, mockFile, url);
    $('div#textIndicator').hide();
    $('.dz-image').siblings().hide();
    $('.dz-image > img').addClass('img-responsive');
}

function displayMessage(type, message) {

    if (timeoutHandler != undefined) {
        clearTimeout(timeoutHandler);
    }

    $('.message-container > span.info-message').html(message);
    $('.message-container').addClass(type).show({slide: 'left', duration: 500});

    timeoutHandler = window.setTimeout(function(){
        $('.message-container').hide({slide: 'right', duration: 500}).removeClass(type);
        $('.message-container > span.info-message').html('');
    }, 5000);
}

function do_request (method, url, data=null, successCallback, errorCallback) {
    $.ajax({
        url: url,
        method: method,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function(data, status, xhr) {
            if (typeof successCallback == "function") {
                successCallback(data);
            }
        },
        error: function (xhr, status, error) {
            if (typeof errorCallback == "function") {
                errorCallback(error);
            }  
        }
    });
}

function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
}

function getDataImageFromUrl (callBack) {
    var fromUrl = $('#imageUrl').val();
    if (fromUrl == '') {
        callBack('', '', '');
    }

    var block1 = fromUrl.split('/');
    var filename = block1[block1.length-1];
    if (filename.indexOf('?') > 0) {
        filename = filename.split('?')[0];
    }
    callBack('', filename, fromUrl);

    // var dataImage = '';
    // var image = new Image();
    // image.crossOrigin = 'use-credentials';
    // // var canvas = document.createElement("canvas"), canvasContext = canvas.getContext("2d");

    // image.onload = function () {
    //     // canvas.width = image.width;
    //     // canvas.height = image.height;
    //     // canvasContext.drawImage(image, 0, 0, image.width, image.height);
    //     // var dataImage = canvas.toDataURL();
    //     var block1 = image.src.split('/');
    //     filename = block1[block1.length-1];
    //     if (filename.indexOf('?') > 0) {
    //         filename = filename.split('?')[0];
    //     }
    //     callBack(dataImage, filename, image.src);
    // }
    // image.src = fromUrl;
}

function sendToAPI (imageData, productId, fromUrl=false) {

    busyIndicator(true);

    var formData = new FormData();
    var fileName = $('#imageData').attr('data-attr-filename');
    
    formData.append("product_id", productId);

    if (!fromUrl) {
        // get the real base64 content of the file
        var block = imageData.split(";");
        var contentType = block[0].split(":")[1]; // In this case "image/gif"
        var realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
        var blob = b64toBlob(realData, contentType); // Convert it to a blob to upload
        formData.append("file", blob, fileName.replace('.jpg', '.png'));
    } else {
        formData.append("product_url", imageData);
    }
        
    do_request('POST', sendToApiLocation, formData, 
        function(data){
            if (data.status == 'error') {
                $('h1#presence').html('');
                $('h1#count').html('');
                displayMessage('error', data.message);    
            } else {
                $('h1#presence').html(data.data.result.presence);
                $('h1#count').html(data.data.result.count);
                init_transactions(0, transactionPerPage);
            }
            busyIndicator(false);
        }, function(error) {
            $('h1#presence').html('');
            $('h1#count').html('');
            displayMessage('error', error.message);
            busyIndicator(false);
        });
}

function busyIndicator (display = true) {
    if (display) {
        $('#busy').addClass('active-process');
    } else {
        $('#busy').removeClass('active-process');
    }
}

$(document).ready(function(){
    init_dropzone();
    init_transactions(0, transactionPerPage);

    do_request('GET', skuListLocation, null, function(data){
        $('#productSKU').autocomplete({
            source: data.data,
            select: function (event, ui){
                event.preventDefault();
                $(this).val(ui.item.label);  
                $('#productId').val(ui.item.value);
            }
        });
    },function(error){
        var data = [
            {value: '1', label: 'Datu Puti'},
            {value: '1', label: 'Mang Tomas'}
        ];
        $('#productSKU').autocomplete({
            source: data,
            select: function (event, ui){
                event.preventDefault();
                $(this).val(ui.item.label);  
                $('#productId').val(ui.item.value);
            }
        });
    });

    $('#submitImage').on('click', function(){
        var imageData = $('#imageData').val();
        var productId = $('#productId').val();

        // try to get the data from the url
        if (imageData == '') {
            getDataImageFromUrl(function(dataImage, filename, url) {
                if (url == '') {
                    displayMessage('error', 'Product image is required');
                } else {
                    $('#imageData').attr('data-attr-filename', filename);
                    preloadImage(filename, url);
                    sendToAPI(url, productId, true);
                }    
            });
        } else {
            if (productId == '') {
                displayMessage('error', 'Product is required');
                return false;
            } else {
                sendToAPI(imageData, productId);
            }
        }
    });

    $('#deleteHistory').on('click', function(e){
        e.preventDefault();
        do_request('DELETE', transactionsLocation, null, function(data){
            displayMessage('success', 'History cleared');
            init_transactions(0, transactionPerPage);
        }, function(error){
            displayMessage('error', 'Unable to clear history');
        });
    });
});

