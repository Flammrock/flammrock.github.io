var link = "https://github.com/Flammrock/flammrock.github.io/blob/master/statictest/liens.txt";

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       console.log(xhttp.responseText;);
    }
};
xhttp.open("GET", link, true);
xhttp.send();
