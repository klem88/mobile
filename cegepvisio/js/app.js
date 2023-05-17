var param = {}
location.search.substr(1).split("&").forEach(
    function(item){
        param[item.split("=")[0]] = item.split("=")[1];
    }
);

//console.log(param);

//var datacolorassocapiurl = "https://dmaster-d25.staging-cyberlibris.com/explovizapi/index.php?db=" + dbname + "datacolorassoc&action=datacolorassoc";	
var databooksref = 'https://dmaster-d25.staging-cyberlibris.com/data/dwh/' + dbname + 'preview.json';
var urlextdoc = 'https://dmaster-d25.staging-cyberlibris.com/data/dwh/';
let urlcovercyber = 'https://static2.cyberlibris.com/books_upload/'; // 300pix/';
let apishelves = "https://dmaster-d25.staging-cyberlibris.com/explovizapi/index.php?db=" + dbname + "api&action=simdocid&docid=";
let apireadings = "https://dmaster-d25.staging-cyberlibris.com/explovizapi/index.php?db=" + dbname + "apireadings&action=simdocid&docid=";
var datacolorassoc = {};
var booksprev = {};
var books = {};
var booksource = {};
var booktype = {};


// TO AVOID CONTEXT MENU APPEARING ON TOP WHEN HOLD EVENT IS FIRED
//It removes the right click on desktop as well!
window.oncontextmenu = function(event) {
	//console.log('contextmenu event');
	
	
	// CONTEXT MENU FOCUS
	event.preventDefault();
	event.stopPropagation();
	return false;
	// /CONTEXT MENU FOCUS
	
};

window.addEventListener('resize', function(){
		if(['inflist'].includes(mynav.topPage.id)){
			viewListOrAccordion()
		} else if(mynav.topPage.id == 'details'){
			d3.select('#detailsDirection').style('flex-direction', function(){
				return (window.innerWidth < window.innerHeight) ? 'column' : 'row';
			})
		};
});

// FIRST GET THE BOOKS - THEY ARE USED FOR ALL COVERS AS WELL AS LOADING THE USER'S BOOKSSHELVES

/*d3.json(datacolorassocapiurl).then(function(res){
	//console.log(res);
	res.docid.map(function(d, i){
		datacolorassoc[d] = res.color[i];
		datacolorassoc[res.color[i]] = d;
		books[d] = res.coverimg[i];
		booksource[d] = res.source[i];
		booktype[d] = res.type[i];
	});
	go();
});*/


let entrykeys1 = 'https://dmaster-d25.staging-cyberlibris.com/data/dwh/' + dbname + 'entrykeys1.json';
let zeitgeist = 'https://dmaster-d25.staging-cyberlibris.com/data/dwh/' + dbname + 'zeitgeistpwa.json';
let endurldescription = '&extra=1';
let youtubebaseurl = 'https://www.youtube.com/embed/';

var currentbookselected = 0;
var flagrefreshfrompage = false;

var initnumberofcoverstoshow = 4;
var numberofcoverstoshow;

var docidlist = [];
var historicbook = [];
var visitedlist = [];

if(!(localStorage.getItem(dbname+'favdocid'))) localStorage.setItem(dbname+'favdocid', '');
var favdocid = (localStorage.getItem(dbname+'favdocid') == '') ? [] : localStorage.getItem(dbname+'favdocid').split(',').map((d)=>{ return  Number(d)});

var nextaction = '';
var dataentries = {};
var selectedlistdocid = {};
var usershelveslist = [];
var extdocdata = {};
var usershelvesready = false;
var homecolor = d3.scaleOrdinal(d3.schemeSet1);


var mynav = document.getElementById('mynav');
var menu = document.getElementById('menu');

Promise.all([
	d3.json(entrykeys1),
	d3.json(zeitgeist),
	d3.json(databooksref),
	d3.csv(urlextdoc + 'extdocpodcasts.csv'),
	d3.csv(urlextdoc + 'extdocvideos.csv')
]).then(function(data){
	console.log(data[0]);

	data[2].docid.map(function(d, i){
		booksprev[d] = data[2].prevdocid[i].split(",");
		booksource[d] = data[2].source[i];
		booktype[d] = data[2].type[i];
		books[d] = data[2].coverimg[i];
	});
	
	// CREATE DATAENTRIES
	homeentries.map(function(d){ dataentries[d.id] = [] });

	// FILL IN DATAENTRIES WITH ENTRY KEYS 1
	data[0].entrykeysopt1.map(function(d, i){
		
		dataentries[optid[d]].push({ 
			'entrykeyen' : data[0].entrykeysnameen1[i], 
			'entrykeyfr' : data[0].entrykeysnamefr1[i], 
			'newdocid' : data[0].entrykeysdocid1[i].split(",").map(function(j){return Number(j)})
		});
	});

	data[3].map(function(d){
		if (typeof extdocdata[d.docid] == 'undefined'){ extdocdata[d.docid] = {} };
		extdocdata[d.docid].podcastid = d.podcastid;
	});
	data[4].map(function(d){
		if (typeof extdocdata[d.docid] == 'undefined'){ extdocdata[d.docid] = {} };
		extdocdata[d.docid].videoid = d.vidurl;
	});

	// FILL IN DATAENTRIES WITH ENTRY KEYS 2 : ZEITGEIST
	zeitgeistkeys = {
		"1mostread1week" : {'en' : 'The weekly MOST read books', 'fr' : 'Les PLUS lus depuis 1 semaine', 'order' : 'a1'},
		"2mostsaved1week" : {'en' : 'The weekly MOST shelved books', 'fr' : 'Les PLUS enregistrés depuis 1 semaine', 'order' : 'a2'},
		"3leastread1week" : {'en' : 'The weekly LEAST shelved books', 'fr' : 'Les MOINS lus depuis 1 semaine', 'order' : 'a3'},
		"4leastsaved1week" : {'en' : 'The weekly LEAST shelved books', 'fr' : 'Les MOINS enregistrés depuis 1 semaine', 'order' : 'a4'},
		"5mostread1month" : {'en' : 'The monthly MOST read books', 'fr' : 'Les PLUS lus depuis 1 mois', 'order' : 'a5'},
		"6mostsaved1month" : {'en' : 'The monthly MOST shelved books', 'fr' : 'Les PLUS enregistrés depuis 1 mois', 'order' : 'a6'},
		"toppub" : {'en' : 'The weekly TOP publishers', 'fr' : 'Le TOP des éditeurs de la semaine', 'order' : 'a7'},
	}
	
	let publist = [];
	data[1].entrykeysname2.map(function(d, i){
		//console.log(d);
		if(d.substring(0, 4) != 'pub|'){
			dataentries['zeitgeist'].push({
				'order' : zeitgeistkeys[d].order, 
				'entrykeyen' : zeitgeistkeys[d].en, 
				'entrykeyfr' : zeitgeistkeys[d].fr, 
				'newdocid' : data[1].entrykeysdocid2[i].split(",").map(function(j){return Number(j)})
			});
		} else if (d.substring(0, 4) == 'pub|'){
			publist.push({
				'order' : 'a' + i, 
				'entrykeyen' : d.replace('pub|',''), 
				'entrykeyfr' : d.replace('pub|',''), 
				'newdocid' : data[1].entrykeysdocid2[i].split(",").map(function(j){return Number(j)})
			})
		};
	})
	if(publist.length > 0){
		dataentries['zeitgeist'].push({
			'order' : zeitgeistkeys['toppub'].order, 
			'entrykeyen' : zeitgeistkeys['toppub'].en, 
			'entrykeyfr' : zeitgeistkeys['toppub'].fr, 
			'newdocid' : publist
		});
	};
	
	//console.log(dataentries);
	
	ons.ready(function() {
		firstinit();
		initialtestlog();
		if (typeof param.docid != 'undefined'){
			currentbookselected = param.docid;
			mynav.pushPage('details.html', {callback : getbookinfo(currentbookselected)});
		} else {
			mynav.pushPage('homepage.html');
		}
	});

});


function firstinit(){

	window.fn = {};

	window.fn.open = function(){
		menu.open();
	};

	loadhome = function(){
		menu.close();
		mynav.resetToPage('homepage.html'); //, { animation: 'fade' } // Si on met l'animation, la liste disparait !! Pourquoi ?
	};

	loadsearch = function(){
		menu.close();
		document.getElementById('searchInputValue').value = ''
		d3.select('#searchModal').node().show();
	};	

	loadvislist = function(){
		menu.close();
		if(visitedlist.length > 0){
			selectedlistdocid = {'shuffle' : true, 'data' : visitedlist};

			mynav.resetToPage('listview.html', {data: {title: 'Visited lists'}});
		} else {
			ons.notification.alert(nolistmess, {cancelable : true, title : 'Oups'})
		};
	};

	loadvisbooks = function(){
		menu.close();
		if(historicbook.length > 0){
			prepareinflist(historicbook, 'History', 0);
		} else {
			ons.notification.alert(nobookmess, {cancelable : true, title : 'Oups'})
		};
	};

	loadfavbooks = function(){
		menu.close();
		if(favdocid.length > 0){
			prepareinflist(favdocid, 'Favorites', 0);
		} else {
			ons.notification.alert(nofavoritemess, {cancelable : true, title : 'Oups'})
		};		
	};

	loadlogin = function(){
		d3.select('#loginmodal').node().show();
	};

	loadshelves = function(){
		if (BookshelfMgr.isAuthenticated()){
			menu.close();
			selectedlistdocid = {'shuffle' : false, 'data' : usershelveslist};
			mynav.resetToPage('listview.html', {data: {title: shelvest}});
		} else {
			d3.select('#loginmodal').node().show();
		}
	};

	filterlist = function(input){
		d3
			.select('#listviewlist')
			.selectAll('ons-list-item')
			.data(selectedlistdocid.data, function(d){ return d.entrykeyfr + d.entrykeyen })
			.style('display', function(d){ return (d['entrykey' + chosenlang].toUpperCase().indexOf(input.toUpperCase()) > -1 | input == '') ? '' : 'none'})
	};

	searchAction = function(input){
		console.log(input);
		let tempDocidList = [];

		function uniFetch(pageNb){
			d3
				.json(platformurl + "/catalog/results/searchterm/" + input + "/sort/score/page/" + pageNb + "?searchtype=all&searchtype=all")
				.then(function(res){
					//console.log(res);
					res.items.map(function(d){ if(typeof books[d.docid] != 'undefined') tempDocidList.push(d.docid); });
					console.log(tempDocidList.length);

					if(tempDocidList.length < 30 & res.page < res.pagecount) {
						uniFetch(res.page+1);
					} else if(tempDocidList.length == 0){ 
						ons.notification.alert(noSearchResult, {cancelable : true, title : 'Oups'}); 
					} else {
						prepareinflist(tempDocidList, input, 0);
					};
				}, function(err) {
					console.log(err);
				});			
		}

		uniFetch(1);
		d3.select('#searchModal').node().hide();

	}

	hideDialog = function(id) {
		document.getElementById(id).hide();
	};

	function checkvisitedlist(key){
		let tempindex = visitedlist.map(function(e){ return e.entrykeyfr + e.entrykeyen }).indexOf(key.entrykeyfr + key.entrykeyen);
		if (/*typeof d != 'undefined' & */tempindex < 0){
			let clone = JSON.parse(JSON.stringify(key));
			if(typeof clone.order != 'undefined') delete clone.order;
			visitedlist.push(clone);
			//console.log(visitedlist);
		};
	}

	//
	// WHEN ONE PAGE INITIALIZES
	//
	document.addEventListener('init', function(event) {
		var page = event.target;

		if (page.id === 'homepage') {
			var homepagelistdata = d3
				.select('#homepagelist')
				.selectAll('ons-list-item')
				.data(homeentries, function(d){ return d.entrykeyfr + d.entrykeyen })
				.enter()
				.append('ons-list-item')
				.style('padding', 0)
				.style('font-variant-caps', 'small-caps')
				.style('font-size', '2em')
				.style('text-align', 'center');

			homepagelistdata
				.append('div')
				.attr('class', 'center')
				.style('background-color', function(d, i){ return homecolor(i); })
				.style('justify-content', 'center')
				.style('height', '20vh')
				.style('color', 'white')
				.style('font-weight', 'bold')
				.style('margin', '5px')
				.on('click', function(d){ 
					if(d.id == 'myshelves'){
						loadshelves();
					} else {
						//console.log(d);
						let shuffleornot = (['decitre', 'institutions', 'smartshelves'].includes(d.id)) ? true : false;

						if(d.id == 'bsummaries'){
							let datatemp = dataentries[d.id][0];
							checkvisitedlist(datatemp);
							prepareinflist(d3.shuffle(datatemp.newdocid), 'Business Book Summaries', 0);
						} else{
							selectedlistdocid =  {'shuffle' : shuffleornot, 'data' : dataentries[d.id]};
							mynav.pushPage('listview.html', {data: {title: d[chosenlang]}});
						}
					};
				})
				.html(function(d){ return d[chosenlang]; });
		} else if (page.id === 'listview') {
			d3
				.select('#listviewlist')
				.selectAll('ons-list-item')
				.data(selectedlistdocid.data
					.sort(function(a,b) { 
						let key = (typeof a.order != 'undefined') ? 'order' : 'entrykey' + chosenlang;
						return (a[key].toUpperCase() > b[key].toUpperCase()) ? 1 : ((b[key].toUpperCase() > a[key].toUpperCase()) ? -1 : 0) 
					})
					//.filter(function(e, i){ return i < 10; })
				)
				.enter()
				.append('ons-list-item')
				.on('click', function(d){ 
					console.log(d);
					if(typeof d.newdocid[0] == 'number'){
						checkvisitedlist(d);
						prepareinflist((selectedlistdocid.shuffle) ? d3.shuffle(d.newdocid) : d.newdocid, d['entrykey' + chosenlang], 0);
					};
				})
				.text(function(d){ return d['entrykey' + chosenlang]; })
				.each(function(d){
					if(typeof d.newdocid[0] != 'number'){
						d3.select(this)
							.attr('expandable', true)
							.append('div')
							.attr('class', 'expandable-content')
							.append('ons-list')
							.selectAll('ons-list-item')
							.data(d.newdocid)
							.enter()
							.append('ons-list-item')
							.on('click', function(d){
								checkvisitedlist(d);
								prepareinflist(d.newdocid, d['entrykey' + chosenlang], 0);
							})
							.text(function(d){ return d['entrykey' + chosenlang]; })
							
							
					}	
				}); 				  	
		} else if (page.id === 'details'){

		} else if (page.id === 'inflist'){
			//console.log('inflist INIT');
		};
	});

	//
	// WHEN ONE PAGE IS HIDDEN
	//
	document.addEventListener('hide', function(event) {
		var page = event.target;
		if (page.id === 'details'){
			
			d3.select('#extdociframe').attr('src', function(){ 
				if (booktype[currentbookselected] == 's') { return currentsoundcloudsrc }
				else if (booktype[currentbookselected] == 'y') { return youtubebaseurl + books[currentbookselected] }
				else return '#';

			});
		}
	})

	//
	// WHEN ONE PAGE IS SHOWN
	//
	document.addEventListener('show', function(event) {
		var page = event.target;
		
		if (page.id === 'homepage') {

		} else if (page.id === 'search') {

		} else if (page.id === 'listview') {
			//console.log(page.data);
			d3.select('#listSearchValue').attr('placeholder', listSearchPlaceholder);
			d3.select('#titlelistview').text(page.data.title);

		} else if (page.id === 'details'){
			setbuttonsvisibility();
			
			
			d3.select('#detailsDirection').style('flex-direction', function(){
				return (window.innerWidth < window.innerHeight) ? 'column' : 'row';
			})
			

			d3.selectAll('#moreinfot').text(moreinfot);

			d3
				.select('#bookdetailadd')	
				.style('visibility', function(){ return (booktype[currentbookselected] == 'b') ? 'visible' : 'hidden' })
				.on('click', opensavemodelcheck);

			d3
				.select('#bookdetailfav')					
				.style('color', function(){ return (favdocid.includes(Number(String(currentbookselected)))) ? 'red' : 'black' })
				.on('click', function(){ clickfavorite(this, Number(String(currentbookselected))) });


		} else if (page.id === 'inflist'){
			//console.log('inflist SHOW');
			numberofcoverstoshow = JSON.parse(JSON.stringify(initnumberofcoverstoshow));
			
			d3.select('#titleinflist')
				.text(page.data.title)
				.on('click', function(){ 
					if (page.data.docid > 0){
						currentbookselected = page.data.docid;
						mynav.bringPageTop('details.html', {callback : getbookinfo(page.data.docid)});
					} else {
						return null;
					};
				})
				.style('text-decoration', function(){ return (page.data.docid > 0) ? 'underline' : null; });

			// MAYBE TEST FOR EXISTENCE FOR INITIALISATION
			d3
				.select('#coverviewlist')
				.selectAll('ons-card')
				.remove();

			d3.select('#inflist .page__content')
				.on('wheel scroll', function(){
					if(window.innerWidth <= window.innerHeight){
						if (d3.select(this).node().offsetHeight + d3.select(this).node().scrollTop >= (0.99 * d3.select(this).node().scrollHeight)){
							console.log('end');
							if(docidlist.length >= numberofcoverstoshow){
								console.log('refresh');
								numberofcoverstoshow += initnumberofcoverstoshow;
								refreshcoverviewlist();								
							}
						};						
					}
				});

			refreshcoverviewlist();
			
			// Ici plutôt que dans le bloc qui s'execute au moment de l'initialisation de la page car le DIV 
			// n'existe pas encore au moment de la création de l'accordéon si la methode resetToPage est utilisée.
			if(document.getElementById('maincanvas_acc') == null) { 
				acc = new accordeon ('acc', platformurl); 
				document.getElementById('maincanvas_acc')
					.addEventListener('clickAccordeonEvent', function (e) { 
						//console.log(e.detail); 
						onclickactioninf(e.detail);
					}, false);				
			};
			// On n'update pas l'accordéon par défaut pour éviter de devoir le charger si l'utilisateur reste en position verticale
			viewListOrAccordion();
		};
	});

	// WHEN THE MODAL FOR SAVING A BOOK IS SHOWN	
	d3.select('#savebookmodal').on('preshow', function(event){
		console.log('Authenticated : ' + BookshelfMgr.isAuthenticated());
		console.log(usershelveslist);
		
		d3.select('#savebooklist').selectAll('ons-list-item').remove();

		// UPDATE SAVE BOOKS MODAL
		var updlist = d3
			//.select('#savebookmodal')
			.select('#savebooklist')
			.selectAll('ons-list-item')
			.data(usershelveslist.sort(function(a,b) { return (a.entrykeyfr.toUpperCase() > b.entrykeyfr.toUpperCase()) ? 1 : ((b.entrykeyfr.toUpperCase() > a.entrykeyfr.toUpperCase()) ? -1 : 0)}),
				function(d){ return d.entrykeyfr + d.entrykeyen; });
		
		//updlist.exit().remove();
		
		updlist	
			.enter()
			.append('ons-list-item')
			//.append('ons-button')
			//.attr('modifier', 'light')
			.on('click', function(d){ console.log(d.entrykeyfr); 
				 
				d3
					.select('#savebooklist')
					.selectAll('ons-list-item')
					.style('pointer-events', 'none');

				save1book(d.entrykeyfr);	
			})
			.text(function(d){ return d.entrykeyfr + ' (' + d.newdocid.length + ')'; });
	});

	// SETUP LANG SELECTION BUTTONS IN SETTINGS
	d3.selectAll('.langselect')
		.on('click', function(d){ 
			clickedlang = d3.select(this).attr('lang');
			if(clickedlang == chosenlang){return}
			else {
				document.getElementById('changelangdialog').show();
			};

		})
};

function viewListOrAccordion(){
	if(window.innerWidth > window.innerHeight){
		swithToAccordion();
	} else {
		switchToInfList();
	};		
}

function swithToAccordion(){
	console.log('swithToAccordion');
	d3.select('#coverviewlist').style('display', 'none');
	d3.select('#acc').style('display', 'block');
	acc.resize(); // Appliquer la fonction une fois que display différent de 'none' sinon l'élement n'existe pas et la taille est nulle.
	let newDocidlist = [];
	docidlist.map(function(d){
		newDocidlist.push({'docid' : d, 'coverimg' : coverimg(d)});
	})
	acc.upd(newDocidlist);
	acc.anim(docidlist.length);
}

function switchToInfList(){
	d3.select('#coverviewlist').style('display', 'block');
	d3.select('#acc').style('display', 'none');
	//acc.resize(); // l'accordéon est réduit à zéro car la taille de l'élément 'none' est nulle.
}

function setbuttonsvisibility(){
	// BOOK SOURCE
	if (booksource[currentbookselected] == 'b') {
		d3.selectAll('#explovizbtn').attr('disabled', null);
		d3.selectAll('#bibliographbtn').attr('disabled', null);
	} else if (booksource[currentbookselected] == 'r') {
		d3.selectAll('#explovizbtn').attr('disabled', 'true');
		d3.selectAll('#bibliographbtn').attr('disabled', null);
	} else if (booksource[currentbookselected] == 's') {
		d3.selectAll('#explovizbtn').attr('disabled', null);
		d3.selectAll('#bibliographbtn').attr('disabled', 'true');
		//d3.selectAll('#openthebookbtn').attr('disabled', 'true');
	};

	// BOOKTYPE
	if (booktype[currentbookselected] == 'b') {
		d3.selectAll('#openthebookbtn').attr('disabled', null);
		d3.selectAll('#addtoshelvesbtn').attr('disabled', null);
	} else {
		d3.selectAll('#openthebookbtn').attr('disabled', 'true');
		d3.selectAll('#addtoshelvesbtn').attr('disabled', 'true');
	};

	// TRAD
	d3.selectAll('#bibliographbtn').text(bibliographbtn);
	d3.selectAll('#explovizbtn').text(explovizbtn);
	d3.selectAll('#openthebookbtn').text(openthebookbtn);
	d3.selectAll('#addtoshelvesbtn').text(addtoshelvesbtn);
	d3.selectAll('#sharebtn').text(function(){ return (navigator.share) ? sharebtn : copybtn });
	d3.selectAll('#closebtn').text(closebtn);
};

function onclickactioninf(docid){
	if (typeof books[Number(docid)] != 'undefined') {
		currentbookselected = Number(docid);
		mynav.bringPageTop('details.html', {callback : getbookinfo(currentbookselected)});
		if (historicbook.indexOf(currentbookselected) < 0) { historicbook.push(currentbookselected)};
	};
};

function clickfavorite(that, docid){

	let tempindex = favdocid.indexOf(Number(docid));
	
	if (docid !== undefined){
		if(tempindex < 0){
			favdocid.push(Number(docid));
			localStorage.setItem(dbname+'favdocid', favdocid);
			d3.select(that)
				.style('color', 'red')
				//.style('text-shadow', '-1px 0 red, 0 1px red, 1px 0 red, 0 -1px red');
			ons.notification.toast(successfavoritein, { timeout: 4000/*, animation: 'fall'*/ });
		} else {
			favdocid.splice(tempindex, 1);
			localStorage.setItem(dbname+'favdocid', favdocid);
			d3.select(that)
				.style('color', 'black')
				//.style('text-shadow', '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black');
			ons.notification.toast(successfavoriteout, { timeout: 4000 });	
		};
	};
};

function shareorcopybtn(){
	if (navigator.share) {
		navigator.share({
			title: sharetitle,
			text: '',
			url: 'index.html?docid=' + currentbookselected,
		})
		.then(() => console.log('Successful share'))
		.catch((error) => console.log('Error sharing', error));
	} else {
		let textArea = document.createElement("textarea");
		textArea.value = window.location.href + '?docid=' + currentbookselected;;

		// Avoid scrolling to bottom
		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		textArea.setSelectionRange(0, 99999); /*For mobile devices*/

		try {
			var successful = document.execCommand('copy');
			var msg = successful ? copiedok : copynok;
			ons.notification.alert(msg, {cancelable : true, title : 'OK'})
		} catch (err) {
			ons.notification.alert(sharenopossible, {cancelable : true, title : 'Oups'})
		}

		document.body.removeChild(textArea);
	}
};

function refreshcoverviewlist(){

	var carddata = d3
		.select('#coverviewlist')
		.selectAll('ons-card')
		.data(docidlist.filter(function(d, i){ return i <= numberofcoverstoshow; }), function(d){ return ('id' + d); })
		.enter()
		.append('ons-card')
		.attr('class', 'coverviewcard');		
		/*.style('padding', 0)
		.style('margin', 0)
		.style('padding-left', '10%')
		.style('padding-right', '10%')*/

	carddata	
		.append('ons-carousel')
		.attr('swipeable', true)
		.attr('auto-scroll', true)
		.style('height', 'max-content')
		.each(function(d){
			var carouseldata = d3.select(this)
				.selectAll('ons-carousel-item')
				//.data([{docid : d, flag : 'orig'}, {docid : booksprev[d][0], flag : 'prev'}, {docid : booksprev[d][1], flag : 'prev'}])
				.data([d, booksprev[d][0], booksprev[d][1]].filter(function(e){ return e!='NA' }).concat([('last' + d)]))
				.enter()
				.append('ons-carousel-item');

			carouseldata
				.each(function(u, i){

					let docidtemp = Number(String(u).replace('last', ''));

					if(String(u).substring(0, 4) == 'last'){
						d3.select(this)
							.append('center')
							.append('h2')
							.text(continueexpl);
						d3.select(this)
							.append('ons-button')
							.style('margin', '2px')
							.attr('id', 'bibliographbtn')
							.attr('modifier', 'large')
							.attr('disabled', function(){ return (booksource[docidtemp] == 's') ? true : null })
							.on('click', function(){ currentbookselected = docidtemp; getsimdocid(apireadings)})
							.text(bibliographbtn);
						d3.select(this)
							.append('ons-button')
							.style('margin', '2px')
							.attr('id', 'explovizbtn')
							.attr('modifier', 'large')
							.attr('disabled', function(){ return (booksource[docidtemp] == 'r') ? true : null })
							.on('click', function(){ currentbookselected = docidtemp; getsimdocid(apishelves)})
							.text(explovizbtn);
					} else {
						d3.select(this)
							.append('span')
							.style('height', '2em')
							.style('width', '3em')
							.style('background-color', 'rgba(0, 0, 0, 1)')
							.style('color', 'white')
							.style('border-radius', '40%')
							//.style('font-weight', 'bold')
							.style('font-size', '0.9em')
							.style('position', 'absolute')
							.style('right', '5px')
							.style('top', '15px')
							.style('text-align', 'center')
							.style('line-height', '2em')
							.style('font-family', 'roboto')
							.text(function(){ return (i+1) + '/' + (booksprev[d].length+1) });
					};
					
					if(booktype[docidtemp] == 's'){
						d3.select(this)
							.append('center')
							.append('h1')
							.style('position', 'absolute')
							.style('font-weight', 'bold')
							.style('font-variant', 'small-caps')
							.style('bottom', '15px')
							.style('pointer-events', 'none')
							.each(function(){ 
								let that = d3.select(this);
								d3.json('https://soundcloud.com/oembed?format=json&url=' + books[docidtemp]).then(function(res){
									console.log(res);
									that.text(res.title);
								}, function(err) {
									console.log(err);
								});
							});
					};

					d3.select(this)
						.append('center')
						.append('img')
						.style('width', function(e){ return (String(u).substring(0, 4) == 'last') ? '45%' : '80%' })
						.attr('class', 'covimg')
						.style('max-height', '75vh')
						//.style('position', 'relative')
						//.style('height', '70%')
						//.style('object-fit', 'cover')
						//.style('object-position', '0 10%')
						.attr('src', function(e){ return coverimg(docidtemp) })
						.on("hold", function(e) {
							currentbookselected = docidtemp;
							document.getElementById('bookdialog').show();
							setbuttonsvisibility();
						})
						.on('click', function(e){ onclickactioninf(docidtemp) });
					
				});			

			var carddatalistitem = carouseldata
				.append('ons-list-item')
				//.style('position', 'relative')
				//.style('height', '30%')

			// ADD	TO BOOKSHELVES ONLY IF IT IS A BOOK
			
			carddatalistitem
				.filter(function(f){ return booktype[Number(String(f).replace('last', ''))] == 'b'; })
				.append('div')
				.attr('class', 'left')
				.append('ons-icon')
				.attr('icon', 'md-plus')
				.style('font-size', '1.8em')
				.on('click', function(f){ currentbookselected = f; opensavemodelcheck() });
		

			carddatalistitem
				.append('div')
				.attr('class', 'right')
				.append('ons-icon')
				.attr('icon', 'md-favorite')
				.style('color', function(f){ return (favdocid.includes(Number(String(f).replace('last', '')))) ? 'red' : 'black' })
				//.style('text-shadow', function(f){ return (favdocid.includes(Number(String(f).replace('last', '')))) ? '-1px 0 red, 0 1px red, 1px 0 red, 0 -1px red' : '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black' })
				.style('font-size', '1.8em')
				.on('click', function(f){ clickfavorite(this, Number(String(f).replace('last', ''))) });
		});

	carddata
		.append('span')
		.style('font-size', '0.8em')
		.style('left', '5px')
		.style('top', '15px')
		.style('font-family', 'roboto')
		.text(function(d, i){ return (i+1) + '/' + (docidlist.length) });
/*		listdata
		.append('img')
		.style('position', 'relative')
		.style('width', '100%')
		.style('height', '70%')
		.style('object-fit', 'cover')
		.style('object-position', '0 10%')
		.attr('src', function(d){ return d.img })
		.on('click', function(d){ onclickactioninf(d.docid) })
		//.on('touchstart', function(d){ d3.event.preventDefault(); timer = setTimeout(onlongtouch(this), touchduration); });


	listdata
		.append('ons-list-item')
		.style('position', 'relative')
		.style('height', '30%')					
		.append('div')
		.attr('class', 'center')
		.each(function(d){
			d3
				.select(this)
				.selectAll('.iconsforcoverview')
				.data(['md-favorite', 'md-plus', 'md-collection-item'])
				.enter()
				.append('ons-icon')
				.attr('class', 'iconsforcoverview')
				.attr('icon', function(d){ return d; })
				.style('padding-left', '10%')
				.style('padding-right', '10%')
				.style('padding-bottom', '5%')
				.style('font-size', '1.8em');
		});
*/			
};

function coverimg(docid){
	if (booktype[docid] == 'y') {
			return 'https://img.youtube.com/vi/' + books[docid] + '/hqdefault.jpg';
		} else if (booktype[docid] == 'b'){
			return urlcovercyber + '300pix/' + books[docid];
		} else if (booktype[docid] == 's'){
			return 'img/podcastimg.gif';
		};
};

function opensavemodelcheck(){
	if(BookshelfMgr.isAuthenticated()){
		d3.select('#savebookmodal').node().show();
	} else {
		d3.select('#loginmodal').node().show();
	};
};


function prepareinflist(listofdocidtoshow, pagetitle, linkeddocid){
	docidlist = [];
	docidlist.length = 0;

	/*listofdocidtoshow
		//.filter(function(d, i){ return i < numberofcoverstoshow; })
		.map(function(d, i){
			if(typeof books[d] != 'undefined'){ 
				let tempcover = '';
				if (booktype[d] == 'y') {
					tempcover = 'https://img.youtube.com/vi/' + books[d] + '/hqdefault.jpg';
				} else if (booktype[d] == 'b'){
					tempcover = urlcovercyber + '300pix/' + books[d];
				} else if (booktype[d] == 's'){
					//getsccover(d, books[d]);
				};
				docidlist.push({docid : d, img : tempcover});
			};
		});*/
		listofdocidtoshow.map(function(d){ if(d != 'NA'){docidlist.push(d)}; });
		
		// POURQUOI PAS UTILISER mynav.topPage.id
		let frompage = d3
			.select('ons-splitter')
			.select('ons-navigator')
			.selectAll('ons-page')
			.filter(function(d){
				return d3.select(this).attr('shown') != null;
			}).attr('id');

		console.log(frompage);
		console.log('compared to : ' + mynav.topPage.id);

		if(frompage == 'inflist'){ 
			mynav.replacePage('inflist.html', {data: {title: pagetitle, docid : linkeddocid}});
		}
			else { mynav.bringPageTop('inflist.html', {data: {title: pagetitle, docid : linkeddocid}}); };
};

function getbookinfo(docid){
	d3.selectAll('#linkedvideoiframe, #linkedpodcastiframe').style('display', 'none').attr('src', null);
	// BOOK TYPE
	if (booktype[docid] == 'b') { getcybermeta(docid); }
	else if (booktype[docid] == 's') { getscmeta(books[docid]); }
	else if (booktype[docid] == 'y') { getyoutubemeta(books[docid]); };
};

function getcybermeta(docid){

	d3.json(`${platformurl}/sapi/info?docid=${docid}${endurldescription}`).then(function(res){
		//console.log(res);
		
		d3
			.select('#bookselcover')
			.style('display', null)
			.attr('src', ()=>{ return (typeof books[docid] != 'undefined') ? (urlcovercyber + '300pix/' + books[docid]) : '#'; })
			.on('click', ()=>{ openthedoc(1) })
			.on('hold', function(){
				document.getElementById('bookdialog').show();
				setbuttonsvisibility();					
			});
		d3
			.select('#extdociframe')
			.style('display', 'none');

		d3
			.select('#booktitle')
			.text(()=>{ return (typeof res.result.title != 'undefined') ? he.decode(res.result.title) : 'Title undefined'; });

		d3
			.select('#bookauthor')
			.text(()=>{ return (typeof res.result.contributor1 != 'undefined') ? he.decode(res.result.contributor1) : 'Author undefined'; });

		d3
			.select('#bookpublisher')
			.text(()=>{ return (typeof res.result.publishername != 'undefined') ? he.decode(res.result.publishername) : 'Publisher undefined'; });

		d3
			.select('#bookpubdate')
			.text(()=>{ return (typeof res.result.pubdate != 'undefined') ? he.decode(res.result.pubdate) : 'Publishing date undefined'; });

		d3
			.select('#bookdescriptionexpand')
			.text(()=>{ if(typeof res.result.description != 'undefined') {
				d3.select('#bookdescription').text(bookdescription);
				return he.decode(res.result.description);
			} else { 
				d3.select('#bookdescription').text('');
				return bookdescriptionund};
			});
	});

	d3.json(platformurl + '/catalog/toc/' + docid).then(function(res){
		//console.log(res);
		if(res != null) {
			d3.select('#booktoc').text(booktoc);
			d3.select('#toclist').selectAll('ons-list-item').remove();
			d3.select('#toclist')
				.selectAll('ons-list-item')
				.data(res)
				.enter()
				.append('ons-list-item')
				.append('div')
				.attr('class', 'center')
				.style('margin-left', function(d){ return (d.level * 2) + 'vw' })
				.on('click', function(d){
					let temppage = (d.vpage == undefined | isNaN(Number(d.vpage))) ? d.page : d.vpage;
					openthedoc(temppage);
				})
				.text(function(d){ return d.name })

		} else { 
			d3.select('#booktoc').text(booktoc);
			d3.select('#toclist').selectAll('ons-list-item').remove();
			//return booktocund;
		};
	});

	// ADD LINKED EXTERNAL DOC IF EXISTS
	if (typeof extdocdata[docid] != 'undefined'){
		setTimeout(setlinkedextdoc, 1000);
	};

	function setlinkedextdoc(){
		if (typeof extdocdata[docid].videoid != 'undefined'){
			console.log(youtubebaseurl + extdocdata[docid].videoid);
			d3.select('#linkedvideoiframe')
				.style('display', null)
				.attr('src', ()=>{ console.log('FOUND VIDO'); return youtubebaseurl + extdocdata[docid].videoid; });
		};

		if (typeof extdocdata[docid].podcastid != 'undefined'){
			var temp = 'https://soundcloud.com/oembed?format=json&url=' + extdocdata[docid].podcastid;
			d3.json(temp).then(function(res){
				//console.log(res);

				let htmlel = document.createElement('html');
				htmlel.innerHTML = res.html;
				let soundcloudsrc = htmlel.getElementsByTagName('iframe')[0].getAttribute('src');

				d3.select('#linkedpodcastiframe')
					.style('display', 'block')
					.attr('src', ()=>{ return soundcloudsrc; });
			})
		};		
	};

}

function getyoutubemeta(vidid){
	let temp = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + vidid + '&key=AIzaSyAlXvPgClXsXZhvLvJVXYFRuKTT0IEWSRg';

	d3.json(temp).then(function(res){
		//console.log(res.items[0]);

		d3
			.select('#bookselcover')
			.style('display', 'none')
			.attr('src', ()=>{ return (typeof vidid != 'undefined') ? ('https://img.youtube.com/vi/' + vidid + '/hqdefault.jpg') : '#'; });

		d3
			.select('#extdociframe')
			.style('display', null)
			.attr('src', ()=>{ return youtubebaseurl + vidid; });

		d3
			.select('#booktitle')
			.text(()=>{ return (typeof res.items[0].snippet.localized.title != 'undefined') ? he.decode(res.items[0].snippet.localized.title) : 'Title undefined'; });

		d3
			.select('#bookauthor')
			.text(null);
		
		d3
			.select('#bookpublisher')
			.text(()=>{ return (typeof res.items[0].snippet.channelTitle != 'undefined') ? he.decode(res.items[0].snippet.channelTitle) : 'Publisher undefined'; });

		d3
			.select('#bookpubdate')
			.text(()=>{ return (typeof res.items[0].snippet.publishedAt != 'undefined') ? he.decode(res.items[0].snippet.publishedAt.substr(0, 4)) : 'Publishing date undefined'; });

		d3
			.select('#bookdescription')
			.text('Description');

		d3
			.select('#bookdescriptionexpand')
			.text(()=>{ return (typeof res.items[0].snippet.localized.description != 'undefined') ? he.decode(res.items[0].snippet.localized.description) : 'Description undefined'; });
	});
};

function getscmeta(scurl){
	//console.log(scurl);
	let temp = 'https://soundcloud.com/oembed?format=json&url=' + scurl; //'https://soundcloud.com/hbrideacast/671-fixing-techs-gender-gap';

	d3.json(temp).then(function(res){
		//console.log(res);

		let htmlel = document.createElement('html');
		htmlel.innerHTML = res.html;
		currentsoundcloudsrc = htmlel.getElementsByTagName('iframe')[0].getAttribute('src');

		d3
			.select('#bookselcover')
			.style('display', 'none')
			.attr('src', ()=>{ return (typeof res.thumbnail_url != 'undefined') ? res.thumbnail_url : '#'; });

		d3
			.select('#extdociframe')
			.style('display', null)
			.attr('src', ()=>{ return currentsoundcloudsrc; });

		d3
			.select('#booktitle')
			.text(()=>{ return (typeof res.title != 'undefined') ? he.decode(res.title) : 'Title undefined'; });

		d3
			.select('#bookauthor')
			.text(()=>{ return (typeof res.author_name != 'undefined') ? he.decode(res.author_name) : 'Author undefined'; });

		d3
			.select('#bookpublisher')
			.text(null);

		d3
			.select('#bookpubdate')
			.text(null);
		
		d3
			.select('#bookdescription')
			.text(bookdescription);

		d3
			.select('#bookdescriptionexpand')
			.text(()=>{ return (typeof res.description != 'undefined') ? he.decode(res.description) : 'Description undefined'; });
	});
};

function getsimdocid(whichapi){
	d3.json(whichapi + currentbookselected).then(function(res){
		//console.log(res);
		if(typeof res == 'undefined' | res.simdocid[0] == 'NA'){
			ons.notification.alert(wrongmess, {cancelable : true, title : 'Oups'})
		} else {
			/*docidlist = [];
			docidlist.length = 0;
			res.simdocid
				.filter(function(d, i){ return i < numberofcoverstoshow; })
				.map(function(d){
					if(typeof books[d] != 'undefined'){ docidlist.push(d) };
				});*/
			let temptitle = (whichapi.indexOf('reading')>=0) ? bibliographbtn : explovizbtn;
			prepareinflist(res.simdocid, temptitle, currentbookselected);
		};
	});
};

function openthedoc(page){
	if (booktype[currentbookselected] == 'b'){
		console.log('Authenticated : ' + BookshelfMgr.isAuthenticated());
		if(BookshelfMgr.isAuthenticated()){
			BookshelfMgr.readBook(currentbookselected, page);
		} else if (localStorage.getItem(dbname+'id') != null & localStorage.getItem(dbname+'pw') != null){
			login();
		} else {
			d3.select('#loginmodal').node().show();
		};
	} /*else if (booktype[currentbookselected] == 'y'){
		iframeurl = youtubebaseurl + books[currentbookselected];
		mynav.pushPage('extdoc.html');
	} else if (booktype[currentbookselected] == 's'){
		iframeurl = currentsoundcloudsrc;
		mynav.pushPage('extdoc.html');
	}*/
}

function initialtestlog(){
	console.log('Authenticated : ' + BookshelfMgr.isAuthenticated());
	if (BookshelfMgr.isAuthenticated()){
		d3.select('#splitterlogin').style('display', 'none');
		d3.select('#splitterlogout').style('display', null);
	} else if (localStorage.getItem(dbname+'id') != null & localStorage.getItem(dbname+'pw') != null){
		login();
	} else {
		d3.select('#splitterlogin').style('display', null);
		d3.select('#splitterlogout').style('display', 'none');
	};
};

function showpsw(that){
	let state = d3.select(that).attr('icon');
	if(state == 'md-eye'){
		d3.select(that).attr('icon', 'md-eye-off');
		d3.select('#pw').attr('type', 'text');
	} else {
		d3.select(that).attr('icon', 'md-eye');
		d3.select('#pw').attr('type', 'password');
	}
};

function prelog(){
	localStorage.setItem(dbname+'id', d3.select('#un').node().value);
	localStorage.setItem(dbname+'pw', d3.select('#pw').node().value);
	login();
};

function login(){
	BookshelfMgr.login(localStorage.getItem(dbname+'id'), localStorage.getItem(dbname+'pw'), function(connectedornot){
		//console.log(connectedornot);
		if (connectedornot){
			refreshshelves();
			d3.select('#splitterlogin').style('display', 'none');
			d3.select('#splitterlogout').style('display', null);
			ons.notification.toast(successconnmess, { timeout: 2000 });
			d3.select('#loginmodal').node().hide();
			menu.close();
		} else {
			localStorage.removeItem(dbname+'id');
			localStorage.removeItem(dbname+'pw');
			ons.notification.alert(wrongcredentialsmess, {cancelable : true, title : 'Oups'});
		};
	});
};

function logout(){
	if(BookshelfMgr.isAuthenticated()){
		BookshelfMgr.logout(function(){
			localStorage.removeItem(dbname+'id');
			localStorage.removeItem(dbname+'pw');
			usershelveslist = [];
			usershelveslist.length = 0;
			ons.notification.toast(unconnmess, { timeout: 2000 });
		});
	};
	d3.select('#splitterlogin').style('display', null);
	d3.select('#splitterlogout').style('display', 'none');
};

function refreshshelves(){
	BookshelfMgr.folders(userfolders);

	function userfolders(folderparam){
		var counttotal = 0;

		usershelves = {};
		usershelveslist = [];

		folderparam.map(function(d){
			usershelves[d.name] = d.id;
			BookshelfMgr.folder_books(d.id, function(userfolderbooks){
				//console.log(userfolderbooks);
				let arraydocid = [];
				userfolderbooks.items.map(function(e){
					if(typeof books[e.docid] != 'undefined') arraydocid.push(e.docid);
				});
				usershelveslist.push({ 'entrykeyfr' : d.name, 'entrykeyen' : d.name, 'newdocid' : arraydocid });

				counttotal += 1;
				if (counttotal == folderparam.length) { /*console.log(usershelves); console.log(usershelveslist);*/ };
			});
		});
	};
};


function save1book(foldername) {
	initialtestlog();
	BookshelfMgr.addBooks(usershelves[foldername], [currentbookselected], (data)=>{
		refreshshelves();
		d3
			.select('#savebooklist')
			.selectAll('ons-list-item')
			.style('pointer-events', 'all');
		d3.select('#savebookmodal').node().hide();
		ons.notification.toast(bookaddedmess + foldername, { timeout: 2000 });

	});
};

function create1shelfandsavebook(){
	initialtestlog();
	var fname = d3.select('#createshelfname').node().value;
	console.log(fname);
	if (fname.length > 0){ 
		if(typeof usershelves[fname] == 'undefined'){
			BookshelfMgr.createFolder(fname, function(data){
				usershelves[fname] = data.folderid;
				save1book(fname);
				d3.select('#createshelfname').node().value = '';
				//refreshshelves();
			});
		} else { ons.notification.alert(shelfexistmess, {cancelable : true, title : 'Oups'}); }
	} else { ons.notification.alert(shelfnamemess, {cancelable : true, title : 'Oups'}); };
};


sendinfo();
function sendinfo(){
	if(typeof window.location.hostname != 'undefined' & window.location.hostname != ''){
	let info = {
		'hostname': (typeof window.location.hostname !== 'undefined') ? window.location.hostname : 'undefined',
		'pathname': (typeof window.location.pathname !== 'undefined') ? window.location.pathname : 'undefined',
		'width': (typeof screen.width !== 'undefined') ? screen.width : 0,
		'height': (typeof screen.height !== 'undefined') ? screen.height : 0
	};
	console.log(info);
	
	$.post("https://dmaster-d25.staging-cyberlibris.com/explovizreceiver/info.php",
	//$.post("http://127.0.0.1:3000/info/newvisit",
		info,
		function(data, status){
			console.log("Data: " + data + "\nStatus: " + status);
		});
	};
};


// MANAGE THE PWA INSTALLATION
d3.select('#installpwa').style('display', 'none');

window.addEventListener('beforeinstallprompt', (e) => {
	console.log('beforeinstallprompt');
	// Prevent the mini-infobar from appearing on mobile
	//e.preventDefault();
	// Stash the event so it can be triggered later.
	deferredPrompt = e;
	d3.select('#installpwa').style('display', null);
});

function installpwa(){
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      d3.select('#installpwa').style('display', 'none');
      //console.log('User accepted the install prompt');
    } else {
      //console.log('User dismissed the install prompt');
    }
  })
};