////////////////////////////
// VARIABLES
var dbname = 'mexecutive';//'mexecutive';//'dwhscholarvox';//'dwhbibliovox';
////////////////////////////

switch (dbname){
	case 'dwhbibliovox':
		homeentries = [
			{fr : "L'air du temps", en : 'ZeitGeist', id : 'zeitgeist'},
			{fr : 'Laissez vous guider', en : 'Need a hand?', id : 'decitre'}, 
			{fr : 'Le choix des bibliothécaires', en : "The librarians' choice", id : 'institutions'}, 
			{fr : 'Mes étagères', en : 'My Shelves', id : 'myshelves'}, 
		];
		optid = {1 : 'decitre', 2 : 'institutions'};
		platformurl = 'https://www.bibliovox.com';
		defaultLang = 'fr';
		break;
	case 'mexecutive':
		homeentries = [
			{fr : "L'air du temps", en : 'ZeitGeist', id : 'zeitgeist'},			
			{fr : 'Laissez vous guider', en : 'Need a hand', id : 'smartshelves'}, 
			{fr : 'Les grands auteurs', en : 'Great writers', id : 'gurus'}, 
			{fr : 'Pressé&middote?', en : 'Rushed?', id : 'bsummaries'}, 
			{fr : 'Mes étagères', en : 'My Shelves', id : 'myshelves'}, 
		];
		optid = {1 : 'smartshelves', 2 : 'gurus', 3 : 'bsummaries'};
		platformurl = 'https://www.business-vox.com';
		defaultLang = 'en';
		break;
	case 'dwhscholarvox':
		homeentries = [
			{fr : "L'air du temps", en : 'ZeitGeist', id : 'zeitgeist'},
			{fr : 'Laissez vous guider', en : 'Need a hand', id : 'smartshelves'}, 
			{fr : 'Les choix des bibliothécaires', en : "The librarians' choice", id : 'institutions'}, 
			{fr : 'Pressé&middote?', en : 'Rushed?', id : 'bsummaries'},
			{fr : 'Mes étagères', en : 'My Shelves', id : 'myshelves'}, 
		];
		optid = {1 : 'smartshelves', 2 : 'institutions', 3 : 'bsummaries'};
		platformurl = 'https://www.scholarvox.com';
		defaultLang = 'en';
		break;
	default:
		homeentries = [];
};


var chosenlang = (localStorage.getItem('lang') != null) ? localStorage.getItem('lang') : defaultLang;
var clickedlang = '';

if(chosenlang == 'fr'){
	homepaget = 'Accueil';
	searcht = 'Rechercher';
	shelvest = 'Mes étagères';
	visitedlit = 'Historique des étagères';
	visitedbot = 'Historique des livres';
	favoritet = 'Favoris';
	splitterlogin = 'Se connecter';
	splitterlogout = 'Se déconnecter';
	settingst = 'Paramètres';
	bibliographbtn = 'Que consulter ensuite ?';
	explovizbtn = "Les conseils des autres lecteurs";
	openthebookbtn = 'Lire';
	addtoshelvesbtn = 'Ajouter à mes étagères';
	closebtn = 'Fermer';
	moreinfot = "Plus d'informations";
	bookdescription = 'Résumé';
	bookdescriptionund = 'Résumé indisponible';
	booktoc = 'Sommaire';
	booktocund = 'Sommaire indisponible';
	continueexpl = 'Poursuivre mon exploration';
	myshelt = "MES ETAGERES";
	shelcreatet = "OU créer une nouvelles étagère";
	createshelfbtn = 'Créer';
	createshelfname = 'Nouvelle étagère';
	enpumet = 'Autoriser les notifications';
	chanlangt = 'Changer de langue';
	surchanglang = 'Etes-vous sûr ?';
	oklangbtn = 'Oui';
	nolangbtn = 'Annuler';
	signin = 'Se connecter';
	cancelsignin = 'Annuler';
	un = 'Utilisateur ou email';
	pw = 'Mot de passe';
	wrongmess = 'Une erreur est survenue';
	wrongcredentialsmess = 'Une erreur est survenue </br> Utilisateur, email ou mot de passe inconnu. </br> Veuillez réessayer';
	shelfexistmess = 'Cette étagère existe déjà';
	shelfnamemess = "Veuillez choisir un nom d'étagère";
	nolistmess = "Pas encore d'étagère parcourue";
	nobookmess = 'Pas encore de livre parcouru';
	nofavoritemess = 'Pas encore de livre favori';
	successconnmess = 'Connecté&middote';
	unconnmess = 'Déconnecté&middote';
	bookaddedmess = 'Livre ajouté dans ';
	sharebtn = "Partager";
	sharenopossible = "Le partage avec une web app n'est pas supporté par ce navigateur";
	sharetext = "Je partage avec vous le livre joint";
	sharetitle = 'Cyberlibris - Livre partagé';
	copybtn = "Copier le lien d'accès";
	copiedok = "Lien copié dans le presse papier";
	copynok = "Echec de la copie";
	installpwa = "Ajouter à l'écran d'accueil";
	successfavoritein = "Les favoris sont temporaires! Enregistrez aussi le livre dans une étagère si besoin.";
	successfavoriteout = 'Le document a été correctement retiré des favoris';
	searchInputBtn = 'Rechercher';
	cancelSearch = 'Annuler';
	searchPlaceholder = 'Rechercher dans la matrice';
	listSearchPlaceholder = 'Rechercher dans la liste';
	noSearchResult = "Aucun résultat n'a été trouvé dans la matrice";
} else {
	homepaget = 'Homepage';
	searcht = 'Search';
	shelvest = 'My shelves';
	visitedlit = 'Visited Lists';
	visitedbot = 'Visited books';
	favoritet = 'Favorites';
	splitterlogin = 'Login';
	splitterlogout = 'Logout';
	settingst = 'Settings';
	bibliographbtn = 'What people do next ?';
	explovizbtn = "Next in people's shelves ?";
	openthebookbtn = 'Read';
	addtoshelvesbtn = 'Add to my shelves';
	closebtn = 'Close';
	moreinfot = "More information";
	bookdescription = 'Abstract';
	bookdescriptionund = 'No Abstract';
	booktoc = 'Table of Content';
	booktocund = 'No Table of Contents';
	continueexpl = 'Continue my exploration';
	myshelt = "MY SHELVES";
	shelcreatet = "OR CREATE A NEW SHELF";
	createshelfbtn = 'Create and save';
	createshelfname = 'New shelf';
	enpumet = 'Enable Push Messaging';
	chanlangt = 'Change Language';
	surchanglang = 'Are you sure ?';
	oklangbtn = 'Yes';
	nolangbtn = 'Cancel';
	signin = 'Sign in';
	cancelsignin = 'Cancel';
	un = 'Username or email';
	pw = 'Password';
	wrongmess = 'Something went wrong </br> No data related to this document.';
	wrongcredentialsmess = 'Something went wrong </br> Unknown username, email or password. </br> Please try again';
	shelfexistmess = 'The shelf already exists </br> Choose another name ';
	shelfnamemess = 'Choose a name for the shelf';
	nolistmess = 'No visited list yet. </br> Visit at least one list.';
	nobookmess = 'No visited book yet. </br> Visit at least one book.';
	nofavoritemess = 'No favorite book yet. </br> Save at least one book as favorite.';
	successconnmess = 'Successful connection';
	unconnmess = 'Successful disconnection';
	bookaddedmess = 'Book Successfully added in ';
	sharebtn = "Share";
	sharenopossible = "Sharing and copying are not supported in this browser";
	sharetext = "Please find this book I'm sharing with you";
	sharetitle = 'Cyberlibris book shared';
	copybtn = "Copy the book's location";
	copiedok = "Book location copied to your clipboard";
	copynok = "Copy did not work";
	installpwa = "Add to homescreen";
	successfavoritein = "Favorites are not saved! Books can also be saved in shelves.";
	successfavoriteout = 'Successfully deleted from the favorites';
	searchInputBtn = 'Search';
	cancelSearch = 'Cancel';
	searchPlaceholder = 'Search in the matrix';
	listSearchPlaceholder = 'Search in list';
	noSearchResult = "No resulta was found in the matrix";
}

