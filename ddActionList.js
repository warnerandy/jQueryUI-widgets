/*
Andy Warner
9/17/2011
ddActionList
*/

(function( $, undefined ) {
	$.widget('ui.ddActionList', {
		options:{
			parentObj:{},
			handleClass:'img',
			showTrash:true,
			showReorderButton:true,
			showAddButton:true,
			showEditButton:true,
			placeholderClasses:'placeholder ui-state-highlight ui-corner-all ddActionList-item',
			clickEvnt:function(){ 
				alert('The item ' + $(this).attr('id') + ' has been clicked.');
			},
			editEvnt:function(){alert('edit')},
			submitEvnt:function(){alert('submit')},
			orderEvnt:function(){alert('reordered')},
			removeEvnt:function(){alert('remove')},
			removeMessage:'Hide this item',
			moveMessage:'Move Here',
			/*itemColumns:[{name:'id'},{name:'fileName'},{name:'filePath'},{name:'fileIcon',fn:'this.getGenericFileIcon(%filePath)'},{name:'description'},{name:'private'}],
			items:[
				{id:1,fileName:'Google is a short name but want a long name to see what happens happens Google is a short name',filePath:'somehtm.pdf',defaultOrder:200, description:'this is some long description of the supporting material that can explain the purpose of the material. The field is limited to 250 characters s1234565',private:true},
				{id:2,fileName:'Ping',filePath:'somepdf.ppt',defaultOrder:100, description:'what is my ip'},
				{id:3,fileName:'xKcd',filePath:'http://xkcd.com',defaultOrder:300, description:'is it funny today?'}
			],
			template:'<div class="ddActionList-item" id="%id"><div class="ddActionList-edit">Edit</div><div class="ddHandle ui-icon-grip-dotted-vertical ui-icon"></div>%fileIcon <span class="title">%fileName</span><span class="description">%description</span></div>',
			newTemplate:'<div class="uploadButton">Upload</div><input type="file" class="upload">',
			detailsForm:[{name:"Name",key:"fileName",type:"text"},{name:"Description",key:"description",type:"textarea"},{name:"Private",key:"private",type:"checkbox"}],*/
			emptyMessage:'No Items Found',
			addButtonText:'Add Item'
		},
		_create:function(){
			//create the default html structure
			this.element.addClass('ddActionList');
			var html = '<div class="ddActionList-menu"><div class="ddActionList-trash">Trashcan</div><div class="menuButton-add">' + this.options.addButtonText + '</div><div class="menuButton-reorder">Reorder Items</div></div><div class="ddActionList-content"></div>';
			this.element.html(html);
			
			//initialize buttons
			$('.ddActionList-menu .menuButton-add').button({icons:{primary:'ui-icon-plusthick'}});
			$('.ddActionList-menu .menuButton-reorder').button({icons:{primary:'ui-icon-arrow-4'}});
			$('.ddActionList-menu .menuButton-unhide').button({icons:{primary:'ui-icon-wrench'}});

			$('.ddActionList-trash').button({icons:{primary:'ui-icon-trash'}});
			$('.ddActionList-trash').hide();
			if (!this.options.showAddButton){
				this.element.find('.ddActionList-menu .menuButton-add').remove();
			}
			if (!this.options.showReorderButton){
				this.element.find('.ddActionList-menu .menuButton-reorder').remove();
			}

			//setup the drag and drop areas
			this.element.find( ".ddActionList-content" ).sortable({
				cursor:'move',
				tolerance:'pointer',
				handle:this.options.handleClass,
				placeholder:this.options.placeholderClasses,
				forcePlaceholderSize:true,
				opacity: 0.4,
				connectWith: '.ddActionList-trash',
				start:function(event,ui){
					ui.item.siblings('.placeholder').html('Move Here');
					ui.item.find('.description').hide();
					ui.item.find('.ddActionList-edit').hide();
					ui.item.css({'display':'inline','width':'auto'});

					//if (this.options.showTrash) {
						$(this).closest('.ddActionList').find('.ddActionList-trash').show('blind');
					//};
				},
				stop:function(event,ui){
					if (ui.item.hasClass('ui-state-error')) {
						//TODO maybe confirm delete
						//TODO hide item in order in the Db
					}
					else{
						//TODO update the order in the Db
						ui.item.find('.ddActionList-edit').show();
						ui.item.find('.description').show();
						//send the entire list to the function
						$(this).closest('.ddActionList').ddActionList('option','orderEvnt')($(ui.item).parent());
						ui.item.css({'display':'block'});
					}
					$(this).closest('.ddActionList').find('.ddActionList-trash').hide('blind');
				}
			}).sortable('option','disabled',true);

			//allow the trashcan to be droppable
			this.element.find('.ddActionList-trash').droppable({
				accept:'.ddActionList-content .ddActionList-item',
				hoverClass:'ui-state-active',
				tolerance:'pointer',
				over:function(event,ui){
					ui.draggable.addClass('ui-state-error');
					ui.draggable.siblings('.placeholder').html($(this).closest('.ddActionList').ddActionList('option','removeMessage'));
					ui.draggable.siblings('.placeholder').removeClass('ui-state-highlight').addClass('ui-state-error');
				},
				out:function(event,ui){
					ui.draggable.removeClass('ui-state-error');
					ui.draggable.siblings('.placeholder').html($(this).closest('.ddActionList').ddActionList('option','moveMessage'));
					ui.draggable.siblings('.placeholder').removeClass('ui-state-error').addClass('ui-state-highlight');
				},
				drop:function(event,ui){
					ui.draggable.hide();
					$(this).closest('.ddActionList').ddActionList('option','removeEvnt')(ui);
				}
			});

			//build the list from the template
			this.buildFromTemplate();
			
			
			$('.ddActionList-edit').button({icons:{primary:'ui-icon-pencil'},text:false});
			
			//add the click events

			//set the click event for an item
			this.element.find('.ddActionList-item').live('click',this.options.items,this.options.clickEvnt);

			//hook up the reorder button
			this.element.find('.ddActionList-menu .menuButton-reorder').live('click',this, function(e){
				//only act if it is the right container
					if(e.data.element.find( ".ddActionList-content" ).sortable('option','disabled') != false){

						e.data.element.find( ".ddActionList-content" ).sortable('option','disabled',false);
						e.data.element.find( ".ddActionList-content" ).disableSelection();
						
						e.data.element.find('.ddHandle').show();
						$(this).button('option','label','Disable Reorder');
					}
					else{
						e.data.element.find( ".ddActionList-content" ).sortable('option','disabled',true);
						e.data.element.find( ".ddActionList-content" ).enableSelection();
						e.data.element.find('.ddHandle').hide();
						$(this).button('option','label','Reorder Items');
					}
				//e.stopImmediatePropagation();
			
			});

			this.element.find('.ddHandle').hide();
			
			//hook up the upload and edit button
			this.element.find('.ddActionList-content .ddActionList-item .addButton, .ddActionList-content .ddActionList-item .uploadButton, .ddActionList-content .ddActionList-item .ddActionList-edit').live('click',this,function(e){
				if (e.data.options.editEvnt == ''){
					e.data.openDetailsDialog($(this).parent().attr('id'));
				}
				else{
					e.data.options.editEvnt(this);
				}
				e.stopImmediatePropagation();
			});

			});

			//hook up the add button
			this.element.find('.ddActionList-menu .menuButton-add').live('click', this,function(e){
				//add the new item to the list
					if (e.data.element.find('.ddActionList-content').children('.ddActionList-pendingUpload').length < 1){
						e.data.element.find('.ddActionList-content').prepend('<div class="ddActionList-item ui-state-highlight ddActionList-pendingUpload"><div class="ddHandle ui-icon-grip-dotted-vertical ui-icon"></div>' + e.data.options.newTemplate + '</div>');
					}

				//determine if the handle should be shown
					if ( e.data.element.find('.ddActionList-content').hasClass('ui-sortable-disabled') ) {
						e.data.element.find('.ddActionList-item .ddHandle').hide();
					};

					//initialize the button
					e.data.element.find('.ddActionList-item .uploadButton').button({icons:{primary:'ui-icon-circle-arrow-n'},text:false});
					e.data.element.find('.ddActionList-item .addButton').button({icons:{primary:'ui-icon-plusthick'},text:false});
			});
			
		},
		//init is called each time this function is called
		_init:function(){
			//init
		},
		buildFromTemplate:function(){
			var html = '';
			this.sortItems('default');

			for (var i = 0; i < this.options.items.length; i++) {
				//set the item to be the template html
				var item = '<div class="ddActionList-item" id="' + this._getIDColumn() + '">';

				//if the edit button is to show add it to the item template
				if (this.options.showEditButton){
					item += '<div class="ddActionList-edit">Edit</div>';
				}
				
				//add the drag and drop handle
				item += '<div class="ddHandle ui-icon-grip-dotted-vertical ui-icon"></div>';
				
				//add the template html and close off the ddActionList-item div
				item += this.options.template + '</div>';
				
				for (var x = 0; x < this.options.itemColumns.length; x++){
					//if there is a custom function to create build the title lets build that and replace all the templated columns with that record's data
					if (typeof(this.options.itemColumns[x].fn) != 'undefined'){
						
						//set the functon to a local var so we dont lose it after we do the relace
						var fn = this.options.itemColumns[x].fn;

						//loop through the itemColumns again to cover our bases with the templated vars
						for (var z = 0; z < this.options.itemColumns.length; z++){
							 fn = fn.replace("%" + this.options.itemColumns[z].name,"'" + this.options.items[i][this.options.itemColumns[z].name] + "'");
						}
						//run the function we just set values to and add it to that item's value for that item name
						//this.options.items[i][this.options.itemColumns[x].name] = eval(fn);
						item = item.replace("%" + this.options.itemColumns[x].name,eval(fn) );
					}
				}
				for (var x = 0; x < this.options.itemColumns.length; x++){
					//replace the columns that are denoted with a % and match the itemColumns array with the item data
					item = item.replace("%" + this.options.itemColumns[x].name,this.options.items[i][this.options.itemColumns[x].name]);
				}
			
				html += item;
			}
			if (this.options.items.length == 0){
				this.element.find('.ddActionList-content').html(this.options.emptyMessage);
			}
			else{
			//draw the elements on the page
				this.element.find('.ddActionList-content').html(html);
			}

			if (this.element.find('.ddActionList-content').hasClass('ui-sortable-disabled')){
				this.element.find('.ddHandle').hide();
			}
		},
		//order functions for the array of item objects
		orderByDefault:function(a,b){
			return a.defaultOrder - b.defaultOrder;
		},
		orderByName:function(a,b){
			return a.filename - b.fileName;
		},
		sortItems:function(type){
			switch(type){
				case 'fileName': 
					this.options.items.sort(this.orderByName);
					break;
				default:
					this.options.items.sort(this.orderByDefault);
			}
		},
		openDetailsDialog:function(id){
			var item = {id:-1};
			for (var i = 0; i < this.options.items.length; i++) {
				if(this.options.items[i].id == id){
					item = this.options.items[i];
				}	
			};
			this.options.items
			this.element.append('<div class="ddActionList-dialog"></div>');
			this.element.find('.ddActionList-dialog').html(this.buildForm(item));
			this.element.find('.ddActionList-dialog').dialog({
				modal:true,
				title:'Edit Details',
				width:400,
				resizable:false,
				buttons:{
					"Save":this.options.submitEvnt,
					"Cancel":function(){
						$(this).remove();
					}
				},
				close:function(){
					$(this).remove();
				}
			});
		},
		buildForm:function(item){
			var html = '';
			var width=250;
			var height=70;
			var checked = '';
			for (var i = 0; i < this.options.detailsForm.length; i++) {

				//set the key to be nothing if the id is -1 otherwise do nothing
				item.id == -1 ?  item[this.options.detailsForm[i].key] = '' :  '';
				
				item[this.options.detailsForm[i].key] ? checked = 'checked': checked = '';

				html += '<label for="' + this.options.detailsForm[i].key + '">' + this.options.detailsForm[i].name + '</label>';
				switch(this.options.detailsForm[i].type){
					case 'text':
						html += '<input type="text" id="' + this.options.detailsForm[i].key + '" name="' + this.options.detailsForm[i].key + '" style="width:' + width + 'px;" value="' + item[this.options.detailsForm[i].key] + '"><br />';
						break;
					case 'textarea':
						html += '<textarea id="' + this.options.detailsForm[i].key + '" name="' + this.options.detailsForm[i].key + '" style="width:' + width + 'px; height:' + height + 'px;">' +  item[this.options.detailsForm[i].key] + '</textarea><br />';
						break;
					case 'radio':
						html += '<input type="radio" id="' + this.options.detailsForm[i].key + '" name="' + this.options.detailsForm[i].key + '" ' + checked + '><br />';
						break;
					case 'checkbox':
						html += '<input type="checkbox" id="' + this.options.detailsForm[i].key + '" name="' + this.options.detailsForm[i].key + '"  ' + checked + '><br />';
						break;
				}
			};
			return html;
		},
		_getIDColumn:function(){
			for (index in this.options.itemColumns){
				if (this.options.itemColumns[index].id){
					return '%' +this.options.itemColumns[index].name;
				}
			}
			return '%id';
		},
		addItem:function(item){
			this.options.items.push(item);
			this.buildFromTemplate();
		}
	});
})(jQuery);
