/**
 * An example of how to handle adding elements to a page.
 * Our use case is: we have multiple elements in browser, and we wish to add another one.
 * Our elements are animated rainbows.
 * This is a rather silly example; in real world, you may encounter this in complex forms
 * with dynamic logic, or dynamic lists with live refresh.
 * But rainbows are more fun!
 * 
 * Also: if you write any bigger application, you usually use some framework to handle this for you.
 * Deep dive if you are interested into what is going on behind the scenes.
 */

/*
 * Immediately Invoked Function Expression pattern (IIFE)
 * http://adripofjavascript.com/blog/drips/an-introduction-to-iffes-immediately-invoked-function-expressions.html
 * http://benalman.com/news/2010/11/immediately-invoked-function-expression/
 */
;(function() {

/*
 * Strict mode for more sane JavaScript
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
 */
"use strict"

/*
 * =======================================
 * VARIABLE INITIALIZATION AND DOM LOOKUPS
 * =======================================
 * Let's keep all elements fetching and variable initialization in one place
 */
const list = document.getElementById("list")
const form = document.getElementById("init")
const buttonRedrawEverything = document.getElementById("add1-redraw")
const buttonAdd1 = document.getElementById("add1-insert")
const counter = document.getElementById("counter")
const timer = document.getElementById("timer")
const rainbows = []

/*
 * =======================================
 *                FUNCTIONS               
 * =======================================
 */

/**
 * Creates and returns a new HTML Element. The animation itself is defined in CSS.
 */
function createRainbow() {
  const el = document.createElement("div")
  // One would usually use classList but this time we are sure the are no other classes
  el.className = "rainbow"
  return el
}

/**
 * A function that renders all elements in the worst possible way:
 * by looping an array and calling .appendChild every step.
 * This forces the browser to draw the whole page for every element there is;
 * Drawing includes computing CSS layout, colors, then drawing pixels,
 * and rendering them to the page. For each element over and over!
 * That means if there are 100 elements in the array, it renders and then throws away
 * all work 99 times. Only the last render is actually displayed long enough for user to notice.
 * 
 * The process of appending element and computing CSS and rendering is called reflow:
 * https://developers.google.com/speed/articles/reflow
 * http://frontendbabel.info/articles/webpage-rendering-101/
 * https://gist.github.com/paulirish/5d52fb081b3570c81e3a
 */
function drawAllRainbows(root, rainbowArray) {
  root.innerHTML = ""
  rainbowArray.forEach(r => {
    root.appendChild(r)
  })
}

/**
 * This function is a little bit smarter: it appends elements to a fragment in a loop,
 * then at the end to the page.
 * This is much faster: appending to fragment does not touch the DOM
 * and does not force the browser to render all the time.
 * Only the last append to HTML element causes drawing.
 * https://davidwalsh.name/documentfragment
 * https://coderwall.com/p/o9ws2g/why-you-should-always-append-dom-elements-using-documentfragments
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment
 * 
 * Much better for rendering, but still there is an important caveat: 
 * at the beginning it discards all rendered elements. What if some of them are already there?
 * What if they have some state? What if they are input fields and users typed into them?
 */
function drawAllRainbows(root, rainbowArray) {
  root.innerHTML = ""
  const fragment = document.createDocumentFragment()
  rainbowArray.forEach(r => {
    fragment.appendChild(r)
  })
  root.appendChild(fragment)
}

/**
 * The best solution for our use case: only append single element to the place we want it to be.
 * This means the performance is the best possible, and other elements do get to keep their state.
 * Be it animation, or filled in and unsaved work.
 */
function appendSingleRainbow(root, rainbowElement, position) {
  /*
   * Because insertBefore accepts elements, not index, we need to fetch it first.
   * https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
   */
  const rainbowAfter = root.children[position]
  root.insertBefore(rainbowElement, rainbowAfter)
}

/**
 * Helper function to help with plurals.
 * Did you know that Internationalization is usually abbreviated as i18n? It means "I then 18 letters then N"
 * Another fun abbreviation is a11y which stands for Accessibility.
 * (I just learned that these are called "numeronyms".)
 */
function printInfo(rainbowArr) {
  const len = rainbowArr.length
  let msg
  if (len === 0) {
    msg = "There are no rainbows"
  } else if (len === 1) {
    msg = "There is one rainbow"
  } else {
    msg = "There are " + len + " rainbows"
  }
  counter.textContent = msg
}

/**
 * Reads a number from the form and renders N rainbows. Basically initializing the view.
 */
function onFormSubmit(e) {
  // We have to preventDefault here to stop the form from redirecting to another page
  e.preventDefault()
  rainbows.length = 0
  for (let i = 0; i < form.count.value; i++) {
    rainbows.push(createRainbow())
  }
  const t0 = performance.now()
  drawAllRainbows(list, rainbows)
  const t1 = performance.now()
  timer.textContent = "Drawing took " + (t1 - t0).toFixed(0) + " milliseconds"
  printInfo(rainbows)
}

/**
 * Resets page to initial state
 */
function reset() {
  rainbows.length = 0
  list.innerHTML = ""
  printInfo(rainbows)
}

function redrawAllHandler() {
  const newRainbow = createRainbow()
  /*
   * unshift puts element to first place in an array
   * and moves all others.
   * There are two methods for adding into an array: push and unshift
   * And two for removing: pop and shift.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop (its friends are linked at the bottom)
   */
  rainbows.unshift(newRainbow)
  /*
   * A bit more precise than Date.now()
   * https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
   */
  const t0 = performance.now()
  drawAllRainbows(list, rainbows)
  const t1 = performance.now()
  timer.textContent = "Drawing took " + (t1 - t0).toFixed(0) + " milliseconds"
  printInfo(rainbows)
}

function appendOneHandler() {
  const newRainbow = createRainbow()
  rainbows.unshift(newRainbow)
  const t0 = performance.now()
  appendSingleRainbow(list, newRainbow, 0)
  const t1 = performance.now()
  timer.textContent = "Drawing took " + (t1 - t0).toFixed(0) + " milliseconds"
  printInfo(rainbows)
}

/**
 * =======================================
 *        ATTACHING EVENT LISTENERS       
 * =======================================
 */
form.addEventListener("submit", onFormSubmit)
form.addEventListener("reset", reset)
buttonRedrawEverything.addEventListener("click", redrawAllHandler)
buttonAdd1.addEventListener("click", appendOneHandler)

}()); // End of IIFE from line 18