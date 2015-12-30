
	function splitInput(str) {
		/*
			* couldn't do YAML file with markdown (content: +++ ##markdown +++) as github seems 
			* to removes YAML from files when accessed in a browser :/
			* couldn't do Markdown file with YAML front matter.  github gives 404 for .md files
			* with YAML front matter, so i can't do that unless i change the extension to .txt. however, then prose.io does not parse markdown.
			* solution: YAML front matter in html comments
		*/

		var yaml_begin = '<!--';
		var yaml_end = '-->';
		
		if (str.slice(0, yaml_begin.length) !== yaml_begin) return;
		
		
		//console.log(str.substr(str.indexOf(yaml_begin)+yaml_begin.length, str.indexOf(yaml_end)-(yaml_end.length+1)));
		
		return {
				yaml : str.substr(str.indexOf(yaml_begin)+yaml_begin.length, str.indexOf(yaml_end)-(yaml_end.length+1)),
				markdown : str.substr(str.indexOf(yaml_end)+yaml_end.length)
			}
	}

	function metaMarked(data) {
		
		var mySplitInput = splitInput(data);

		return mySplitInput ?  {
				meta : jsyaml.safeLoad(mySplitInput['yaml']),
				html : marked(mySplitInput['markdown'])
			} : {
				meta : null,
				html : marked(data)
			};
	};



	function loadMarkdown(req,pushstate) {

		if (pushstate) {
			window.history.pushState({ url: req }, "", req); 
		}
		
		if (req=="/") {
				fn=md_path+index_md; //file name
		} else {
				fn=md_path+req.substr(1)+".md";
		}
			
		var jqxhr = $.get(fn, function( data ) {
				
			var md = metaMarked(data);
			//console.log(md.meta);
			var content_holder=document.getElementById('content');
			content_holder.innerHTML = md.html;
		
			//window.scrollTo(0, 0); // not needed as we are not using hash tags
			//$('nav ul').blur(); // tried for mobile, not working
			
			
			$("#edit").html('<a href="//github.com/'+user_name+'/'+repo_name+'/edit/master/'+fn+'">Edit markdown for this page</a>"');
			$("#edit").show();
			
			if (md.meta) {
				if (md.meta["Title"]!==undefined) {
					document.title=site_title+" - "+md.meta["Title"]
				} else {	
					document.title=site_title;
				}
				
				if (md.meta["Scripts"]!==undefined) {
					$.ajaxSetup({
					  cache: true
					});
					var num_of_scripts = md.meta["Scripts"].length;
					var scripts_loaded = 0;
					$.each( md.meta["Scripts"], function( key, value ) {
						$.getScript(value,function() { 
								scripts_loaded++;
								if (scripts_loaded==num_of_scripts) {
									if (md.meta["Javascript"]!==undefined) {
										jQuery.globalEval(jQuery.trim(md.meta["Javascript"]));
									}	
								}	
						});
					});
				} else if (md.meta["Javascript"]!==undefined) {
					jQuery.globalEval(jQuery.trim(md.meta["Javascript"]));
				} 						
				
			} else {
				document.title=site_title;
			}
			
		});
		
		jqxhr.fail(function(e) {
			if (e.status=="404") {
				document.getElementById('content').innerHTML = '<p><center>404. This page does not exist.</p><p><a href="//github.com/'+user_name+'/'+repo_name+'/new/master?filename='+fn+'">Create this page</a></center></p>';
				$("#edit").hide();
			}	
		});
	}	
						
			
	function processClicks(obj) {
		
		var req=$(obj).attr("href");
		
		if (req.substring(0,1)==="?" || req==="/") {
			window.event.preventDefault ? window.event.preventDefault() : window.event.returnValue = false;
				
			
			loadMarkdown(req,true);
		}
						
		
		
	}	



	function hasScrolled() {
		var navbar_height = $('header').outerHeight();
						
		var st = $(this).scrollTop();

		// instead of == 0
		if (st < 30) {
		// we have scrolled all the way up
		
			$('header').removeClass('nav-up').removeClass('smaller');  
								
		} else if (st > lastScrollTop) {
		// Scroll Down
			//console.log("// scroll down");
			
			if (st > 0 && st <= navbar_height ) {
				// on first scroll down, we go small	
				// console.log("// on first scroll down, we go small");
				$('header').addClass('smaller');
			} else if (st > navbar_height) {
				// then we disapper	
				// console.log("// then we disapper");
				
				$('header').addClass('smaller').addClass('nav-up');
			}
		
		} else {
			
		// Scroll Up
			// console.log("// scroll up");
			
			$('header').removeClass('nav-up');
		}
		lastScrollTop = st;
	}
