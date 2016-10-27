// Brandon Couts
// 10/14/2013

function GET() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function each(objects, func) {
	if(objects){
		var l = objects.length;
		for(var i = 0; i < l; i++) {
			func(objects[i],i);
		}
	}	
}

angular.module('Swizz',[])
.controller('ShoppingCartCtrl', function($scope, $http) {
	$scope.code = "~";
	$scope.image = "Level_1";
	$scope.overlay = "";
	$scope.tip = 0;
	$scope.name = "";
	$scope.items = [];

	$scope.bases = [];
	$scope.shades = [];
	$scope.characters = [];
	$scope.options = [];

	$scope.s = [];
	$scope.s.lvl  = [];	
	$scope.s.shade = [];
	$scope.s.character = [];
	$scope.option = [];
	
	$http.get('json/art.txt').success( function( data ) {
		
		var l = data.length;
		for(var i = 0; i < l; i++) {
			$scope.bases.push(data[i]);
			if(data[i].starting) {
				$scope.s.lvl = angular.copy(data[i]);
				$scope.addItem(data[i]);
				loadData(data[i]);
			}
		}
		
		if(GET()['s']) {
			$scope.decode(GET()['s']);
		}
	}).error(function( data ){
		
	});

	/* Dropdown stuff --------------------------- */
	$scope.activateDropdown = function (o) {
		if(o.active) o.active = false; else	o.active = true;
	}
	
	$scope.swapSelected = function(o, base, notumble) {
		if(base.group == "base")
		{
			$("#overlay").children(":not(.preview)").each(function(index, element) {
				$(element).remove();
			});
		}
		
		o.name = base.name;
		o.price = base.price;
		o.description = base.description;
		
		if(base.combinations != null)
			o.combinations = base.combinations;
		
		o.active = false;
		
		if(!notumble) {
			clearData();
			loadData(base);
		}

		$scope.addItem(base);
		
		clearCombos();
		
		addCombos();
	}
	/* End Dropdown stuff ----------------------- */
	
	$scope.addItemWithCombos = function(item)
	{
		$scope.addItem(item);
		
		addCombos();
	}
	
	function addCombos()
	{
		var addedItems = [];

		//Check for combinations
		for(var i = 0; i < $scope.items.length; i++)
		{
			for(var j = 0; j < $scope.items.length; j++)
			{
				if(i == j)
					continue;
				
				//Find a valid combination
				for(var k = 0; k < $scope.s.lvl.combinations.length; k++)
				{
					var OK = true;
					var Name = "";

					//console.log("Testing combination for " + k);
					
					for(var l = 0; l < $scope.s.lvl.combinations[k].combination.length; l++)
					{
						//console.log("Combo: " + $scope.s.lvl.combinations[k].combination[l]);
							
						var Found = false;
						
						for(var m = 0; m < $scope.items.length; m++)
						{
							if($scope.items[m].name == $scope.s.lvl.combinations[k].combination[l])
							{
								Found = true;
								
								break;
							}
						}
						
						if(!Found)
						{
							OK = false;
							
							break;
						}
						
						Name = Name + (Name.length > 0 ? " + " : "") + "\"" + $scope.s.lvl.combinations[k].combination[l] + "\"";
					}
					
					//console.log("Combination for " + k + ": " + OK);
						
					if(!OK)
						continue;
					
					//Verify Not conditions
					if($scope.s.lvl.combinations[k].not != null)
					{
						//console.log("Testing Not for " + k);
						
						for(var l = 0; l < $scope.s.lvl.combinations[k].not.length; l++)
						{
							//console.log("Not: " + $scope.s.lvl.combinations[k].not[l]);
							
							for(var m = 0; m < $scope.items.length; m++)
							{
								if($scope.items[m].name == $scope.s.lvl.combinations[k].not[l])
								{
									OK = false;
								
									break;
								}
							}
							
							if(!OK)
								break;
						}
					
						//console.log("Not for " + k + ": " + OK);
					
						if(!OK)
							continue;
					}
					
					addedItems.push({
							name: Name,
							price: $scope.s.lvl.combinations[k].price,
							combo: $scope.s.lvl.combinations[k].combination
						});
				}
			}
		}
		
		for(var i = 0; i < addedItems.length; i++)
		{
			$scope.addItem(addedItems[i]);
		}
	}
	
	function clearCombos() {
		for(var i = $scope.items.length - 1; i >= 0; i--)
		{
			if(!($scope.items[i].combo instanceof Array))
				continue;
			
			$scope.items.splice(i, 1);
		}
	}
	
	function clearData() {
		for(var i = 0; i < $scope.items.length; i++)
		{
			if($scope.items[i].overlayelement)
				$scope.items[i].overlayelement.remove();
		}
		
		$scope.items = [];
		$scope.shades = [];
		$scope.characters = [];
	}
	
	function loadData(base) {
		var level = gLIBA($scope.bases, base.name, 'name');
		
		// if we find the level
		if(level) {
			console.log("Loading data");
			
			// Set the selects to None selected
			$scope.s.shade.name = "None";
			$scope.s.shade.price = 0;
			$scope.s.character.name = "None";
			$scope.s.character.price = 0;
			
			// Initialize a blank entry at the top of the select
			var sb = {"name":"None","price":"N/A","group":"shading"};
			var cb = {"name":"None","price":"N/A","group":"character"};
			
			// Add the blank entry
			$scope.shades.push(sb);
			$scope.characters.push(cb);
			
			each(level.options, function(option) {
				if(option.name === 'Colour') {
					$scope.option.colour = option;
				} else if(option.name === 'Background') {
					$scope.option.background = option;
				} else if(option.name === 'Closeup/Internal') {
					$scope.option.internal = option;
				} else if(option.name === '+Swizz') {
					$scope.option.swizz = option;
				} else if(option.group === 'shading') {
					$scope.shades.push(option);
				} else if(option.group === 'character') {
					$scope.characters.push(option);
				}
			});
		} else
			alert("Could not find the entry: "+ base.name);
		console.log($scope.shades);
	}
	
	
	$scope.displayPrice = function (price) {
		if(price && price > 0)
			return "$"+price;
		if(price && price === 0)
			return "Free";
		else
			return "N/A";
	}
	
	$scope.amount = function () {
		var total = 0;
		
		if(parseFloat($scope.tip))
			total = parseFloat(total) + parseFloat($scope.tip);
		
		var l = $scope.items.length;
		
		for(var i = 0; i < l; i++)
		{
			var price = $scope.items[i].price;
			
			total = parseFloat(total) + parseFloat(price);
		}
		
		return total.toFixed(2);
	}

	$scope.removeItem = function(item) {
		if(item) {
			if(item.overlayfilename != null)
				item.overlayitem.remove();
			
			var l = $scope.items.length;
			for(var i = 0; i < l; i++) {
				if($scope.items[i].name === item.name){
					$scope.items.splice(i,1);
					break;
				}
			}
		}

		clearCombos()
		addCombos()
	}
	
	$scope.addItem = function(item) {
		if(item){
			if(item.group === "base") {
				removeBase();
				$scope.items.push(angular.copy(item));
			} else {
				var existingGroupItem = gLIBA($scope.items, item.group, 'group');
				if(existingGroupItem || item.name === "none") {
					$scope.removeItem(existingGroupItem);
					clearCombos();
					addCombos();
				}

				if(item.type === "button" 
				&& !existingGroupItem
				&& !(item.price === "N/A"))
				{
					$scope.items.push(angular.copy(item));

					if(item.overlayfilename != null && item.overlayposition != null)
					{
						$scope.items[$scope.items.length - 1].overlayitem = $("<img src=\"images/" + item.overlayfilename + ".png\" style=\"position: absolute; left: " + 
							item.overlayposition[0] + "px; top: " + item.overlayposition[1] + "px;\">");
						$("#overlay").append($scope.items[$scope.items.length - 1].overlayitem);
					}
				}

	
				if(!(item.type === "button")
				&& !(item.price === "N/A")
				&& !(gLIBA($scope.items, item.name, 'name')))
				{
					$scope.items.push(angular.copy(item));

					if(item.overlayfilename != null && item.overlayposition != null)
					{
						$scope.items[$scope.items.length - 1].overlayitem = $("<img src=\"images/" + item.overlayfilename + ".png\" style=\"position: absolute; left: " + 
							item.overlayposition[0] + "px; top: " + item.overlayposition[1] + "px;\">");
						$("#overlay").append($scope.items[$scope.items.length - 1].overlayitem);
					}
				}
			}
		}
		
		itemCleanUp();
	}
	
	function itemCleanUp() {
		sortItems($scope.items);
		
		encodeItems();
		encodeImage();
	}
	
	function sortItems(items) {
		for(;;)
		{
			var Found = false;
			
			for(var i = 0; i < items.length - 1; i++)
			{
				if(items[i].group == "base")
					continue;
				
				if(items[i].name > items[i + 1].name)
				{
					var temp = items[i];
					items[i] = items[i + 1];
					items[i + 1] = temp;
					Found = true;
						
					break;
				}
			}
				
			if(!Found)
				break;
		}
	}
	
	// Comparative function
	function itemSort(a,b){
		console.log("sorting");

		if(a.name < b.name)
			return -1;
		if(a.name > b.name)
			return 1;
		if(a.group === "base")
			return -1;
		if(b.group === "base")
			return -1;
		if(a.group > b.group)
			return 1;
		else if(b.group > a.group)
			return -1;
		else if(a.code > b.code)
			return 1;
		else if(b.code > a.code)
			return -1;
	}
	
	function getItemByCode(code) {
		var item = getListItemByAttribute($scope.items, code, "code");

		return item;
	}
	
	function getArtByCode(code) {
		var item = getListItemByAttribute($scope.bases, code, "code");
		if(!item) 
			var item = getListItemByAttribute($scope.options, code, "code");
		return item;
	}
	
	// Duplicate of bellow for ease
	function gLIBA(list, comparator, attribute) {
		if(list) {
			var l = list.length;
			if(l > 0) {
				for(var i = 0; i < l; i++) {
					if(list[i][attribute] && list[i][attribute] === comparator) {
						return list[i];
					}
				}
			}
		}
		return null;
	}
	
	function getListItemByAttribute(list, comparator, attribute) {
		var l = list.length;
		if(l > 0)
			for(var i = 0; i < l; i++) 
				if(list[i][attribute] === comparator)
					return list[i];
		return null;
	}
	
	function removeBase() {
		var l = $scope.items.length;
		for(var i = 0; i < l; i++) {
			if($scope.items[i].group === "base") {
				$scope.items.splice(i,1);
				removeBase();
				break;
			}
		}
	}
	
	function encodeItems() {
		var c = "~";
		var l = $scope.items.length;
		for(var i = 0; i < l; i++) {
			if($scope.items[i].code == null)
				continue;
			
			if($scope.items[i].group === "base")
				c = $scope.items[i].code + c;
			else
				c = c + $scope.items[i].code;
		}
		$scope.code = c;
	}
	
	function encodeImage() {
		var c = "";
		var l = $scope.items.length;
		
		for(var i = 0; i < l; i++)
		{
			if($scope.items[i].combo != null || $scope.items[i].ignoresfilename != null)
				continue;
			
			var Name = "" + $scope.items[i].name;
			
			c = c + (c.length ? "_" : "") + Name.replace(" ", "_").replace("+", "");
		}

		$scope.image = c;
	}
	
	$scope.decode = function(code) {
		// Creates a new reference
		$scope.items = [];
		var c = code;
		var l = $scope.bases.length;
		var base;
		
		for(var i = 0; i < l; i++)
			if(c.indexOf($scope.bases[i].code) !== -1) {
				//$scope.addItem($scope.bases[i]);
				$scope.swapSelected($scope.s.lvl,$scope.bases[i],false);
				base = $scope.bases[i];
				break;
			}
		if(base){
			console.log("options");
			console.log(base);
			for(var i = 0; i < base.options.length; i++) {
				console.log(base.options[i]);
				if(c.indexOf(base.options[i].code) !== -1) {
					if(base.options[i].group === "shading")
						$scope.swapSelected($scope.s.shade,base.options[i], true);
					else if(base.options[i].group === "character")
						$scope.swapSelected($scope.s.character,base.options[i], true);
					else
						$scope.addItem(base.options[i]);
				}
			}
		}
	}

});



