(function($, cloudStack, testData) {

  var zoneObjs, podObjs, clusterObjs;
  var selectedClusterObj;

  cloudStack.sections.system = {
    title: 'System',
    id: 'system',
    sectionSelect: {
      label: 'Select view'
    },
    sections: {
      physicalResources: {
        type: 'select',
        title: 'Physical Resources',
        listView: {
          id: 'physicalResources',
          label: 'Physical Resources',
          fields: {
            name: { label: 'Zone' },
            dns1: { label: 'DNS' },
            internaldns1: { label: 'Internal DNS' },
            networktype: { label: 'Network Type' },
            allocationstate: { label: 'State' }
          },
          actions: {
            add: {
              label: 'Add zone',
              action: {
                custom: cloudStack.zoneWizard({
                  action: function(args) {
                    args.response.success({});
                  }
                })
              },
              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to add ' + args.name + '?';
                },
                notification: function(args) {
                  return 'Created new zone';
                }
              },
              notification: {
                poll: testData.notifications.testPoll
              }
            }
          },
          
		      dataProvider: function(args) {  
			      $.ajax({
			        url: createURL("listZones&page="+args.page+"&pagesize="+pageSize),
			        dataType: "json",
			        async: true,
			        success: function(json) { 
				        zoneObjs = json.listzonesresponse.zone;			    
				        args.response.success({data:zoneObjs});			                			
			        }
			      });  	
		      },
          detailView: {
            pageGenerator: cloudStack.zoneChart({              
			        dataProvider: function(args) {                             
                args.response.success({data:args.jsonObj});	
		          },			  
              detailView: {
                name: 'Zone details',
                viewAll: { path: '_zone.pods', label: 'Pods' },
                tabs: {
                  details: {
                    title: 'Details',
                    fields: [
                      {
                        name: { label: 'Zone' }
                      },
                      {
                        dns1: { label: 'DNS 1' },
                        dns2: { label: 'DNS 2' },
                        internaldns1: { label: 'Internal DNS 1' },
                        internaldns2: { label: 'Internal DNS 2' }
                      },
                      {
                        networktype: { label: 'Network Type' },
                        allocationstate: { label: 'State' },
                        vlan: { label: 'VLAN' },
                        networktype: { label: 'Network Type' },
                        securitygroupenabled: { label: 'Security Group?' }
                      }
                    ],
                    dataProvider: testData.dataProvider.detailView('zones')
                  },
                  resources: {
                    title: 'Resources',
                    fields: [
                      {
                        iptotal: { label: 'Total IPs' },
                        cputotal: { label: 'Total CPU' },
                        bandwidthout: { label: 'Bandwidth (Out)'},
                        bandwidthin: { label: 'Bandwidth (In)'}
                      }
                    ],
                    dataProvider: function(args) {
                      setTimeout(function() {
                        args.response.success({
                          data: {
                            iptotal: 1000,
                            cputotal: '500 Ghz',
                            bandwidthout: '14081 mb',
                            bandwidthin: '31000 mb'
                          }
                        });
                      }, 500);
                    }
                  }
                }
              }
            })
          }
        },
        subsections: {
          networks: {
            listView: {
              section: 'networks',
              id: 'networks',
              fields: {
                name: { label: 'Name' },
                startip: { label: 'Start IP' },
                endip: { label: 'End IP' },
                type: { label: 'Type' }
              },
			        
              //dataProvider: testData.dataProvider.listView('networks'),
			        dataProvider: function(args) {                   
                var zoneObj = args.context.zones[0];             	
				        var networkArray = [];
				        var showPublicNetwork = true;
			          if(zoneObj.networktype == "Basic") {   
					        //$("#add_network_button").hide();	
					        $.ajax({
						        url: createURL("listExternalFirewalls&zoneid=" + zoneObj.id),
						        dataType: "json",
						        async: false,
						        success: function(json) {            
							        var items = json.listexternalfirewallsresponse.externalfirewall;    		   
							        if(items != null && items.length > 0) {
								        showPublicNetwork = true;
								        //$("#add_iprange_button,#tab_ipallocation").show();
							        }
							        else {
								        showPublicNetwork = false;  
								        //$("#add_iprange_button,#tab_ipallocation").hide();	    		    	  
							        }
						        }
					        });       	
				        }
				        else { // "Advanced"  
					        showPublicNetwork = true;
					        //$("#add_network_button,#add_iprange_button,#tab_ipallocation").show();	
					        
					        //listMidMenuItems2(("listNetworks&type=Direct&zoneId="+zoneObj.id), networkGetSearchParams, "listnetworksresponse", "network", directNetworkToMidmenu, directNetworkToRightPanel, directNetworkGetMidmenuId, false, 1);
					        $.ajax({
					          url: createURL("listNetworks&type=Direct&zoneId=" + args.ref.zoneID + "&page=" + args.page + "&pagesize=" + pageSize),
					          dataType: "json",
					          async: false,
					          success: function(json) { 				    
						          networkArray = json.listnetworksresponse.network;  			    
						          //args.response.success({data:items});			                			
					          }
					        }); 					
				        }
				        
				        if(showPublicNetwork == true && zoneObj.securitygroupsenabled == false) { //public network           
					        //$midmenuContainer.find("#midmenu_container_no_items_available").remove();  //There is always at least one item (i.e. public network) in middle menu. So, "no items available" shouldn't be in middle menu even there is zero direct network item in middle menu.   
					        $.ajax({
						        url: createURL("listNetworks&trafficType=Public&isSystem=true&zoneId=" + zoneObj.id),
						        dataType: "json",
						        async: false,
						        success: function(json) {       
							        var items = json.listnetworksresponse.network;       
							        if(items != null && items.length > 0) {
								        var item = items[0];
								        //var $midmenuItem1 = $("#midmenu_item").clone();                      
								        //$midmenuItem1.data("toRightPanelFn", publicNetworkToRightPanel);  //to implement later                           
								        //publicNetworkToMidmenu(item, $midmenuItem1);    
								        //bindClickToMidMenu($midmenuItem1, publicNetworkToRightPanel, publicNetworkGetMidmenuId);   
												
								        //$midmenuContainer.prepend($midmenuItem1.show());    //prepend public network on the top of middle menu
								        networkArray.unshift(item);
								        
								        //$midmenuItem1.click();  
							        }
						        }
					        });  
				        }
				        else if (showPublicNetwork == true && zoneObj.securitygroupsenabled == true){
					        //$midmenuContainer.find("#midmenu_container_no_items_available").remove();  //There is always at least one item (i.e. public network) in middle menu. So, "no items available" shouldn't be in middle menu even there is zero direct network item in middle menu.   
					        $.ajax({
						        data: createURL("command=listNetworks&type=Direct&trafficType=Guest&isSystem=true&zoneId="+zoneObj.id),
						        dataType: "json",
						        async: false,
						        success: function(json) {       
							        var items = json.listnetworksresponse.network;       
							        if(items != null && items.length > 0) {
								        var item = items[0];
								        //var $midmenuItem1 = $("#midmenu_item").clone();                      
								        //$midmenuItem1.data("toRightPanelFn", publicNetworkToRightPanel);                             
								        //publicNetworkToMidmenu(item, $midmenuItem1);    
								        //bindClickToMidMenu($midmenuItem1, publicNetworkToRightPanel, publicNetworkGetMidmenuId);   
												
								        //$midmenuContainer.prepend($midmenuItem1.show());    //prepend public network on the top of middle menu
								        networkArray.unshift(item);
								        
								        //$midmenuItem1.click();  
							        }
						        }
					        });  
					      }
				        else {
					        //publicNetworkToRightPanel(null);	
				        }				
				        args.response.success({data:networkArray});		               
			        },	
			        
              detailView: {
                viewAll: { label: 'Hosts', path: 'instances' },
                tabs: {
                  details: {
                    title: 'Details',
                    fields: [
                      {
                        name: { label: 'name' },
                        displaytext: { label: 'displaytext' }
                      },
                      {
                        broadcastdomaintype: { label: 'broadcastdomaintype' },
                        traffictype: { label: 'traffictype' },
                        gateway: { label: 'gateway' },
                        netmask: { label: 'netmask' },
                        startip: { label: 'startip' },
                        endip: { label: 'endip' },
                        zoneid: { label: 'zoneid' },
                        networkofferingid: { label: 'networkofferingid' },
                        networkofferingname: { label: 'networkofferingname' },
                        networkofferingdisplaytext: { label: 'networkofferingdisplaytext' },
                        networkofferingavailability: { label: 'networkofferingavailability' },
                        isshared: { label: 'isshared' },
                        issystem: { label: 'issystem' },
                        state: { label: 'state' },
                        related: { label: 'related' },
                        broadcasturi: { label: 'broadcasturi' },
                        dns1: { label: 'dns1' },
                        type: { label: 'type' }
                      }
                    ],
                    dataProvider: testData.dataProvider.detailView('networks')
                  }
                }
              }
            }
          },
          pods: {
            title: 'Pods',
            listView: {
              id: 'pods',
              section: 'pods',
              fields: {
                name: { label: 'Name' },
                startip: { label: 'Start IP' },
                endip: { label: 'End IP' },
                allocationstate: { label: 'Status' }
              },
              
			        //dataProvider: testData.dataProvider.listView('pods'),
			        dataProvider: function(args) {                  		  
				        $.ajax({
				          url: createURL("listPods&zoneid=" + args.ref.zoneID + "&page=" + args.page + "&pagesize=" + pageSize),
				          dataType: "json",
				          async: true,
				          success: function(json) { 				    
					          var items = json.listpodsresponse.pod;  			    
					          args.response.success({data:items});			                			
				          }
				        });  	
			        },	
			        
              actions: {
                destroy: testData.actions.destroy('pod')
              },
              detailView: {
                viewAll: { path: '_zone.clusters', label: 'Clusters' },
                tabs: {
                  details: {
                    title: 'Details',
                    fields: [
                      {
                        name: { label: 'Name' },
                      },
                      {
                        allocationstate: { label: 'State' },
                        startip: { label: 'Start IP' },
                        endip: { label: 'End IP' },
                      }
                    ],
                    dataProvider: testData.dataProvider.detailView('pods')
                  },
                }
              }
            }
          },
          clusters: {
            title: 'Clusters',
            listView: {
              id: 'clusters',
              section: 'clusters',
              fields: {
                name: { label: 'Name' },
                zonename: { label: 'Zone' },
                podname: { label: 'Pod' }
              },
              
			        //dataProvider: testData.dataProvider.listView('clusters'),
			        dataProvider: function(args) {                  		  
				        $.ajax({
				          url: createURL("listClusters&zoneid=" + args.ref.zoneID + "&page=" + args.page + "&pagesize=" + pageSize),
				          dataType: "json",
				          async: true,
				          success: function(json) { 				    
					          var items = json.listclustersresponse.cluster;  			    
					          args.response.success({data:items});			                			
				          }
				        });  	
			        },
			        
              actions: {			    
				        add: {
				          label: 'Add cluster',

				          messages: {
					          confirm: function(args) {
					            return 'Are you sure you want to add a cluster?';
					          },
					          success: function(args) {
					            return 'Your new cluster is being created.';
					          },
					          notification: function(args) {
					            return 'Creating new cluster';
					          },
					          complete: function(args) {
					            return 'Cluster has been created successfully!';
					          }
				          },

				          createForm: {
					          title: 'Add cluster',
					          desc: 'Please fill in the following data to add a new cluster.',
					          fields: {
					            hypervisor: {
						            label: 'Hypervisor',
						            select: function(args) {					  
						              $.ajax({
							              url: createURL("listHypervisors"),			 
							              dataType: "json",
							              async: false,
							              success: function(json) { 				   
							                var hypervisors = json.listhypervisorsresponse.hypervisor;	
							                var items = [];
                              $(hypervisors).each(function() {							      
							                  items.push({id: this.name, description: this.name})
							                });				  
							                args.response.success({data: items});					  
							              }
						              });     
						              
						              args.$select.bind("change", function(event) {						    
							              var $form = $(this).closest('form');
							              if($(this).val() == "VMware") {							  
							                //$('li[input_sub_group="external"]', $dialogAddCluster).show();
							                $form.find('.form-item[rel=vCenterHost]').css('display', 'inline-block'); 
							                $form.find('.form-item[rel=vCenterUsername]').css('display', 'inline-block'); 
							                $form.find('.form-item[rel=vCenterPassword]').css('display', 'inline-block'); 
							                $form.find('.form-item[rel=vCenterDatacenter]').css('display', 'inline-block'); 
							                
							                //$("#cluster_name_label", $dialogAddCluster).text("vCenter Cluster:");							  
							              } 
							              else {
							                //$('li[input_group="vmware"]', $dialogAddCluster).hide();
							                $form.find('.form-item[rel=vCenterHost]').css('display', 'none'); 
							                $form.find('.form-item[rel=vCenterUsername]').css('display', 'none'); 
							                $form.find('.form-item[rel=vCenterPassword]').css('display', 'none'); 
							                $form.find('.form-item[rel=vCenterDatacenter]').css('display', 'none'); 
							                
							                //$("#cluster_name_label", $dialogAddCluster).text("Cluster:");							 
							              }					    
						              });                        				  
						            }				
					            },
					            podId: {
                        label: 'Pod',
                        select: function(args) {						  
					                $.ajax({
							              url: createURL("listPods&zoneid=" + args.context.zones[0].id),			 
							              dataType: "json",
							              async: true,
							              success: function(json) { 				   
							                var pods = json.listpodsresponse.pod;	                              
                              var items = [];
							                $(pods).each(function() {
							                  items.push({id: this.id, description: this.name});
							                });							  
							                args.response.success({data: items});					  
							              }
						              });  
						            }
					            },
					            name: {
						            label: 'Cluster Name',
						            validation: { required: true }
					            },
					  					
					            //hypervisor==VMWare begins here
					            vCenterHost: {
						            label: 'vCenter Host',
						            validation: { required: true }
					            },
					            vCenterUsername: {
						            label: 'vCenter Username',
						            validation: { required: true }
					            },
					            vCenterPassword: {
						            label: 'vCenter Password',
						            validation: { required: true }
					            },
					            vCenterDatacenter: {
						            label: 'vCenter Datacenter',
						            validation: { required: true }
					            }
					            //hypervisor==VMWare ends here			  
					          }
				          },				  			  
				          
				          action: function(args) {								
					          var array1 = [];
					          array1.push("&zoneId=" + args.context.zones[0].id);	
					          array1.push("&hypervisor=" + args.data.hypervisor);	
					          array1.push("&clustertype=CloudManaged");
					          array1.push("&podId=" + args.data.podId);

					          var clusterName = args.data.name;
					          if(args.data.hypervisor == "VMware") {
						          array1.push("&username=" + todb(args.data.vCenterUsername));	
						          array1.push("&password=" + todb(args.data.vCenterPassword));
						          
						          var hostname = args.data.vCenterHost;
						          var dcName = args.data.vCenterDatacenter;
						          
						          var url;					
						          if(hostname.indexOf("http://") == -1)
							          url = "http://" + hostname;
						          else
							          url = hostname;
						          url += "/" + dcName + "/" + clusterName;
						          array1.push("&url=" + todb(url));
						          
						          clusterName = hostname + "/" + dcName + "/" + clusterName; //override clusterName
					          } 					
					          array1.push("&clustername=" + todb(clusterName));
										
					          $.ajax({
					            url: createURL("addCluster" + array1.join("")),
					            dataType: "json",
					            async: true,
					            success: function(json) { 	
                        var item = json.addclusterresponse.cluster[0];  						
                        args.response.success({data: item});							
					            },
					            error: function(XMLHttpResponse) {					    
					              var errorMsg = parseXMLHttpResponse(XMLHttpResponse);	
					              args.response.error(errorMsg);
					            }
					          });  	
				          },
				          
				          notification: {
					          poll: function(args) {			  
					            args.complete();
					          }			  
				          }				  
				        },
							  
                destroy: testData.actions.destroy('cluster')
              },
              detailView: {
                viewAll: { path: '_zone.hosts', label: 'Hosts' },
                tabs: {
                  details: {
                    title: 'Details',
                    fields: [
                      {
                        name: { label: 'Name' },
                      },
                      {
                        allocationstate: { label: 'State' },
                        podname: { label: 'Pod' },
                        hypervisortype: { label: 'Hypervisor' },
                        clustertype: { label: 'Cluster' },
                      }
                    ],

                    dataProvider: testData.dataProvider.detailView('clusters')
                  },
                }
              }
            }
          },
          hosts: {
            title: 'Hosts',
            id: 'hosts',
            listView: {
              section: 'hosts',
              fields: {
                name: { label: 'Name' },
                zonename: { label: 'Zone' },
                podname: { label: 'Pod' }
              },
			        
              //dataProvider: testData.dataProvider.listView('hosts'), 
			        dataProvider: function(args) {                  		  
				        $.ajax({
				          url: createURL("listHosts&type=Routing&zoneid=" + args.ref.zoneID + "&page=" + args.page + "&pagesize=" + pageSize),
				          dataType: "json",
				          async: true,
				          success: function(json) { 				    
					          var items = json.listhostsresponse.host;			    
					          args.response.success({data:items});			                			
				          }
				        });  	
			        },
			        
              actions: {
                add: {
                  label: 'Add host',

                  createForm: {
                    title: 'Add new host',
                    desc: 'Please fill in the following information to add a new host fro the specified zone configuration.',
                    fields: {
                      podId: {
                        label: 'Pod',
						            validation: { required: true },
                        select: function(args) {                          
						              $.ajax({
							              url: createURL("listPods&zoneid=" + args.context.zones[0].id),			 
							              dataType: "json",
							              async: true,
							              success: function(json) { 				   
							                var pods = json.listpodsresponse.pod;	                              
                              var items = [];
							                $(pods).each(function() {
							                  items.push({id: this.id, description: this.name});
							                });							  
							                args.response.success({data: items});					  
							              }
						              });  
                        }
                      },
					            
                      clusterId: {
                        label: 'Cluster',
						            validation: { required: true },
                        dependsOn: 'podId',
                        select: function(args) {
						              
						              
                          $.ajax({
							              url: createURL("listClusters&podid=" + args.podId),			 
							              dataType: "json",
							              async: false,
							              success: function(json) { 				   
							                clusterObjs = json.listclustersresponse.cluster;                        
                              var items = [];
							                $(clusterObjs).each(function() {
							                  items.push({id: this.id, description: this.name});
							                });							  
							                args.response.success({data: items});					  
							              }
						              });  
                     			
                          args.$select.change(function() {                            
                            var $form = $(this).closest('form');
                            
                            var clusterId = $(this).val();
							              if(clusterId == null)
								              return;    
                            
							              var items = [];							
                            $(clusterObjs).each(function(){							    
							                if(this.id == clusterId){
								                selectedClusterObj = this;
									              return false; //break the $.each() loop 
								              }								    
							              });	
							              if(selectedClusterObj == null)
								              return;   
								            
							              if(selectedClusterObj.hypervisortype == "VMware") {								
								              //$('li[input_group="general"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=hostname]').hide();
								              $form.find('.form-item[rel=username]').hide();
								              $form.find('.form-item[rel=password]').hide();
								              
								              //$('li[input_group="vmware"]', $dialogAddHost).show();
								              $form.find('.form-item[rel=vcenterHost]').css('display', 'inline-block'); 
								              
								              //$('li[input_group="baremetal"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=baremetalCpuCores]').hide();
								              $form.find('.form-item[rel=baremetalCpu]').hide();
								              $form.find('.form-item[rel=baremetalMemory]').hide();
								              $form.find('.form-item[rel=baremetalMAC]').hide();
								              
								              //$('li[input_group="Ovm"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=agentUsername]').hide();
								              $form.find('.form-item[rel=agentPassword]').hide();
							              } 
							              else if (selectedClusterObj.hypervisortype == "BareMetal") {
							                //$('li[input_group="general"]', $dialogAddHost).show();
								              $form.find('.form-item[rel=hostname]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=username]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=password]').css('display', 'inline-block'); 
							                
								              //$('li[input_group="baremetal"]', $dialogAddHost).show();
								              $form.find('.form-item[rel=baremetalCpuCores]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=baremetalCpu]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=baremetalMemory]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=baremetalMAC]').css('display', 'inline-block'); 
															
								              //$('li[input_group="vmware"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=vcenterHost]').hide();								
								              
								              //$('li[input_group="Ovm"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=agentUsername]').hide();
								              $form.find('.form-item[rel=agentPassword]').hide();								
							              } 
							              else if (selectedClusterObj.hypervisortype == "Ovm") {								
								              //$('li[input_group="general"]', $dialogAddHost).show();   
                              $form.find('.form-item[rel=hostname]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=username]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=password]').css('display', 'inline-block'); 
								              
								              //$('li[input_group="vmware"]', $dialogAddHost).hide();    	
                              $form.find('.form-item[rel=vcenterHost]').hide();		
								              
								              //$('li[input_group="baremetal"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=baremetalCpuCores]').hide();
								              $form.find('.form-item[rel=baremetalCpu]').hide();
								              $form.find('.form-item[rel=baremetalMemory]').hide();
								              $form.find('.form-item[rel=baremetalMAC]').hide();
								              
                              //$('li[input_group="Ovm"]', $dialogAddHost).show();	
                              $form.find('.form-item[rel=agentUsername]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=agentUsername]').find('input').val("oracle");
								              $form.find('.form-item[rel=agentPassword]').css('display', 'inline-block'); 							
							              } 
							              else {    		
								              //$('li[input_group="general"]', $dialogAddHost).show();
								              $form.find('.form-item[rel=hostname]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=username]').css('display', 'inline-block'); 
								              $form.find('.form-item[rel=password]').css('display', 'inline-block'); 
								              
								              //$('li[input_group="vmware"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=vcenterHost]').hide();	
								              
								              //$('li[input_group="baremetal"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=baremetalCpuCores]').hide();
								              $form.find('.form-item[rel=baremetalCpu]').hide();
								              $form.find('.form-item[rel=baremetalMemory]').hide();
								              $form.find('.form-item[rel=baremetalMAC]').hide();
								              
								              //$('li[input_group="Ovm"]', $dialogAddHost).hide();
								              $form.find('.form-item[rel=agentUsername]').hide();
								              $form.find('.form-item[rel=agentPassword]').hide();					
							              }     							
                          });		
						              
						              args.$select.trigger("change");
                        }
                      },

					            hosttags: {
                        label: 'Host tags',
                        validation: { required: false }
                      },
					            
					            //input_group="general" starts here
                      hostname: {
                        label: 'Host name',
                        validation: { required: true },
                        hidden: true
                      },

                      username: {
                        label: 'User name',
                        validation: { required: true },
                        hidden: true
                      },

                      password: {
                        label: 'Password',
                        validation: { required: true },
                        hidden: true
                      },						  
                      //input_group="general" ends here
					            
					            //input_group="VMWare" starts here
					            vcenterHost: {
                        label: 'ESX/ESXi Host',
                        validation: { required: true },
                        hidden: true
                      },
                      //input_group="VMWare" ends here
					            
					            //input_group="BareMetal" starts here
					            baremetalCpuCores: {
                        label: '# of CPU Cores',
                        validation: { required: true },
                        hidden: true
                      },
					            baremetalCpu: {
                        label: 'CPU (in MHz)',
                        validation: { required: true },
                        hidden: true
                      },
					            baremetalMemory: {
                        label: 'Memory (in MB)',
                        validation: { required: true },
                        hidden: true
                      },
					            baremetalMAC: {
                        label: 'Host MAC',
                        validation: { required: true },
                        hidden: true
                      },
                      //input_group="BareMetal" ends here
					            
					            //input_group="OVM" starts here
					            agentUsername: {
                        label: 'Agent Username',
                        validation: { required: false },
                        hidden: true
                      },
					            agentPassword: {
                        label: 'Agent Password',
                        validation: { required: true },
                        hidden: true
                      }
					            //input_group="OVM" ends here
                    }
                  },

                  action: function(args) {				    
					          var array1 = [];				    
					          array1.push("&zoneid=" + args.context.zones[0].id);										
					          array1.push("&podid=" + args.data.podId);	
					          array1.push("&clusterid=" + args.data.clusterId);	
					          array1.push("&hypervisor=" + todb(selectedClusterObj.hypervisortype));			    
					          var clustertype = selectedClusterObj.clustertype;
					          array1.push("&clustertype=" + todb(clustertype));
					          array1.push("&hosttags=" + todb(args.data.hosttags));			    
					          
					          if(selectedClusterObj.hypervisortype == "VMware") {
						          array1.push("&username=");
						          array1.push("&password=");
						          var hostname = args.data.vcenterHost;						
						          var url;					
						          if(hostname.indexOf("http://")==-1)
							          url = "http://" + hostname;
						          else
							          url = hostname;
						          array1.push("&url=" + todb(url));						
					          } 
					          else {						
						          array1.push("&username=" + todb(args.data.username));		
						          array1.push("&password=" + todb(args.data.password));
						          
						          var hostname = args.data.hostname;
						          
						          var url;					
						          if(hostname.indexOf("http://")==-1)
							          url = "http://" + hostname;
						          else
							          url = hostname;
						          array1.push("&url="+todb(url));
											
						          if (selectedClusterObj.hypervisortype == "BareMetal") {							
							          array1.push("&cpunumber=" + todb(args.data.baremetalCpuCores));
							          array1.push("&cpuspeed=" + todb(args.data.baremetalCpu));
							          array1.push("&memory=" + todb(args.data.baremetalMemory));							
							          array1.push("&hostmac=" + todb(args.data.baremetalMAC));
						          }
						          else if(selectedClusterObj.hypervisortype == "Ovm") {							
							          array1.push("&agentusername=" + todb(args.data.agentUsername)); 
							          array1.push("&agentpassword=" + todb(args.data.agentPassword));			        	
						          }
					          }
									  
					          $.ajax({
					            url: createURL("addHost" + array1.join("")),
						          dataType: "json",
						          success: function(json) { 							    
						            var item = json.addhostresponse.host[0];  						
							          args.response.success({data: item});							
						          },
						          error: function(XMLHttpResponse) {	
							          var errorMsg = parseXMLHttpResponse(XMLHttpResponse);	
							          args.response.error(errorMsg);
						          }		
					          });								  
                  },

                  notification: {
                    poll: testData.notifications.customPoll(testData.data.hosts[0])
                  },

                  messages: {
                    notification: function(args) {
                      return 'Added new host';
                    }
                  }
                },				
                destroy: testData.actions.destroy('host')
              },
              detailView: {
                tabs: {
                  details: {
                    title: 'Details',
                    fields: [
                      {
                        name: { label: 'Name' },
                      },
                      {
                        type: { label: 'Type' },
                        zonename: { label: 'Zone' },
                      }
                    ],

                    //dataProvider: testData.dataProvider.detailView('hosts')
					          dataProvider: function(args) {	              
					            args.response.success({data:args.jsonObj});	
					          }		
					          
                  },
                }
              }
            }
          },
          'primary-storage': {
            id: 'primaryStorage',
            listView: {
              section: 'primary-storage',
              fields: {
                name: { label: 'Name' },
                zonename: { label: 'Zone' },
                podname: { label: 'Pod' }
              },
			        
              //dataProvider: testData.dataProvider.listView('clusters'),
			        dataProvider: function(args) {                  		  
				        $.ajax({
				          url: createURL("listStoragePools&zoneid=" + args.ref.zoneID + "&page=" + args.page + "&pagesize=" + pageSize),
				          dataType: "json",
				          async: true,
				          success: function(json) { 				    
					          var items = json.liststoragepoolsresponse.storagepool;  			    
					          args.response.success({data:items});			                			
				          }
				        });  	
			        },	
			        
              actions: {
                destroy: testData.actions.destroy('cluster')
              },
              detailView: {
                tabs: {
                  details: {
                    title: 'Details',
                    fields: [
                      {
                        name: { label: 'Name' },
                      },
                      {
                        zonename: { label: 'Zone' },
                        hostname: { label: 'Host' }
                      }
                    ],

                    dataProvider: testData.dataProvider.detailView('clusters')
                  }
                }
              }
            }
          },
		      
          'secondary-storage': {
            id: 'secondary-storage',
            listView: {
              section: 'seconary-storage',
              fields: {
                name: { label: 'Name' },
                zonename: { label: 'Zone' },
                podname: { label: 'Pod' }
              },
              
			        //dataProvider: testData.dataProvider.listView('clusters'),
			        dataProvider: function(args) {                  		  
				        $.ajax({
				          url: createURL("listHosts&type=SecondaryStorage&zoneid=" + args.ref.zoneID + "&page=" + args.page + "&pagesize=" + pageSize),
				          dataType: "json",
				          async: true,
				          success: function(json) { 				    
					          var items = json.listhostsresponse.host;  			    
					          args.response.success({data:items});			                			
				          }
				        });  	
			        },	
			        
              actions: {
                destroy: testData.actions.destroy('cluster')
              },
              detailView: {
                tabs: {
                  details: {
                    title: 'Details',
                    fields: [
                      {
                        name: { label: 'Name' },
                      },
                      {
                        zonename: { label: 'Zone' },
                        hostname: { label: 'Host' }
                      }
                    ],

                    dataProvider: testData.dataProvider.detailView('clusters')
                  }
                }
              }
            }
          }
        }        
      },
      virtualAppliances: {
        type: 'select',
        title: 'Virtual Appliances',
        id: 'virtualAppliances',
        listView: {
          label: 'Virtual Appliances',
          fields: {
            name: { label: 'Name' },
            hostname: { label: 'Hostname' },
            publicip: { label: 'Public IP' },
            publicmacaddress: { label: 'Public MAC' },
            state: { label: 'Status' }
          },
          dataProvider: testData.dataProvider.listView('virtualAppliances')
        }
      },
      systemVMs: {
        type: 'select',
        title: 'System VMs',
        listView: {
          label: 'System VMs',
          fields: {
            name: { label: 'Name' },
            zonename: { label: 'Zone' },
            hostname: { label: 'Hostname' },
            privateip: { label: 'Private IP' },
            publicip: { label: 'Public IP' },
            state: { label: 'Status' }
          },
          dataProvider: testData.dataProvider.listView('systemVMs')
        }
      }
    }
  };
})($, cloudStack, testData);