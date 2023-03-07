let text = ["life-long learner", "ML engineer", "stoic", "programmer", "musician", "mixed martial arts enthusiast", "data scientist"];
let counter = 0;

setInterval(change, 3000);

function change() {
  document.getElementById("intro").setAttribute("class", "text-fade");

  setTimeout(() => {
    document.getElementById("intro").innerHTML = text[counter];
    document.getElementById("intro").setAttribute("class", "text-show");
  }, 1000)

  counter++;

  if (counter >= text.length) {
    counter = 0;
  }
}