$(document).ready(function() {
    $("#submit").click(function(){
        $.ajax({
            beforeSend: function(req){
                req.setRequestHeader('Access-Control-Allow-Origin', 'https://localhost:8080');
            },
            type: 'GET',
            url: '/login', 
            
        })
    });
});
