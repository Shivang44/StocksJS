var baseURL = 'https://finance.google.com/finance/getchart?';
var stockSymbols = [];
var stockMap = {};
var timeIntervals =  ['1d', '5d', '1M', '3M', '6M', '1Y', '2Y', '5Y', '1000Y'];
var tickIntervals = ['300', '1000', '100000', '100000', '100000', '100000', '100000', '100000', '10000'];
var currentInterval = 0;

/* Generates a stock URL given the correct params. Returns -1 if incorrect number of pararms. */
function generateURL(stockSymbol, timeInterval, tickInterval) {
	if (arguments.length != 3) {
  	throw "Invalid params passed to generateURL.";
  }
	var queryParams = ['q', 'p', 'i'];
  var url = baseURL;
  for (var i = 0; i < queryParams.length; i++) {
  	if (i == 0) {
    	url += queryParams[i] + '=' + arguments[i];
    } else {
      url += '&' + queryParams[i] + '=' + arguments[i];
    }
  }
  return url;
}

/* Inserts into the DOM a stock chart image for every symbol in the stockSymbols array. */
function updateDOM() {
	var stockImages = document.getElementById('stockImages');
  stockImages.innerHTML = '';
	stockSymbols.forEach(function(symbol) {
  	// Insert stock image
  	var img = document.createElement('img');
    img.src = stockMap[symbol];
    stockImages.append(img);

    // Insert stock name
    var stockName = document.createElement("h2");
    stockName.innerHTML = symbol  + " - " + timeIntervals[currentInterval];
    img.parentNode.insertBefore(stockName, img.nextSibling);
  });
}

/*
* Updates stockMap for any symbol in stockSymbols that is not mapped to a stock object.
* stockMap maps symbol => url
* stockObj is an object that contains an imageURL
*/
function updateStockMap() {
	stockSymbols.forEach(function(symbol) {
      stockMap[symbol] = generateURL(symbol, timeIntervals[currentInterval], tickIntervals[currentInterval]);
  });
}

/* Appends to the stock symbol list every stock symbol. */
function addSymbolsToList() {
	var stockList = document.getElementById('stockList');
  stockList.innerHTML = '';
  stockSymbols.forEach(function(symbol, index) {
  	var li = document.createElement("li");
    var content = document.createTextNode(symbol);
    li.append(content);
    li.addEventListener('click', function(){
    	deleteStock(this.innerHTML);
    	this.remove();
    }, false);
    stockList.append(li);
  });
}

/* Performs initial loading of stock symbols from browser's local storage. */
function loadFromLocalStorage() {
	var stocks = localStorage.getItem('symbols');
  if (stocks !== null) {
  	stockSymbols = stocks.split(',');
    updateStockMap();
    updateDOM();
    addSymbolsToList();
  }
}

/* Updates the stock symbols in the local storage whenever a new stock is added/deleted. */
function updateLocalStorage() {
	localStorage.setItem('symbols', stockSymbols.join(','));
}

/* Removes symbol from stockSymbols array, and updates the DOM and local storage. */
function deleteStock(symbol) {
	var index = stockSymbols.indexOf(symbol);
  if (index > -1) {
  	stockSymbols.splice(index, 1);
    delete stockMap[symbol];
    updateDOM();
    updateLocalStorage();
  }
}

/* Callback to "Add Stock" button. Adds stock to stockSymbols array, generates the stock map (mapping       *  symbols to stock chart URLs), and updates the DOM and local storage.
*/
function addStock() {
	// Get user input and parse into stockSymbols array
  var textInputBox = document.getElementById('stockInput');
  var textInput = textInputBox.value;
  var symbols = textInput.split(",");
  symbols.forEach(function(symbol) {
  	symbol = symbol.trim().toUpperCase();
    if (stockSymbols.indexOf(symbol) < 0) {
    	stockSymbols.push(symbol);
    }
  });
  stockSymbols.sort();
  addSymbolsToList();
  updateStockMap();
  updateDOM();
  textInputBox.value = '';
  updateLocalStorage();
}

/* JS modulus does not do clock arithmetic */
function mod(a, b) {
	return ((a % b) + b) % b;
}

/* Decreases the current interval (1d, 5d, etc) of chart, and redraws on DOM */
function decInterval() {
  currentInterval = mod(currentInterval - 1, timeIntervals.length);
  updateStockMap();
  updateDOM();
}

/* Same but increases interval. */
function incInterval() {
  currentInterval = mod(currentInterval + 1, timeIntervals.length);
  updateStockMap();
  updateDOM();
}



function init() {
	document.getElementById('addStockButton').addEventListener('click', addStock, false);
	document.getElementById('leftArrow').addEventListener('click', decInterval, false);
	document.getElementById('rightArrow').addEventListener('click', incInterval, false);
	// Load from local storage any stocks stored into stockSymbols array
  loadFromLocalStorage();
  // Sort stockSymbols array
  stockSymbols.sort();
	// Generate stock object for each stockSymbol (url, currentInterval, etc)
  updateStockMap();
  // Insert into DOM each stock
  updateDOM();
} init();
