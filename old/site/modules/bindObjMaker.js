const oracledb = require('oracledb');

module.exports = {

    bindObjMaker (objInput, data, type) {
        
        let {ip} = data
        //ip = ip.ip


        // { id : {val: 1 }, nm : {val: 'Chris'}  
        var now = new Date()
		
        var bindsObj = {};
    
        var spec = objInput.specificationData;
    
        switch(type) {
    
            case "pc_attributes":
    
                bindsObj.nm      = {val: objInput.name}
                bindsObj.abr     = {val: objInput.abbreviation}    
                bindsObj.tin     = {val: objInput.tin }    
                bindsObj.psrn    = {val: objInput.psrn}    
                bindsObj.rd      = {val: objInput.reg_date }    
                bindsObj.okpo    = {val: objInput.okpo}    
                bindsObj.lac     = {val: objInput.legal_address_country}     
                bindsObj.lad     = {val: objInput.legal_address}   
                bindsObj.aar     = {val: objInput.actual_address_region}   
                bindsObj.aad     = {val: objInput.actual_address}      
                bindsObj.pho     = {val: objInput.phone}      
                bindsObj.mpho    = {val: objInput.mobile_phone}    
                bindsObj.fax     = {val: objInput.fax}   
                bindsObj.email   = {val: objInput.email} 
                bindsObj.site    = {val: objInput.site}    
                bindsObj.adbn    = {val: objInput.account_details_bank_name}  
                bindsObj.adsett  = {val: objInput.account_details_settlement_acc } 
                bindsObj.adcorr  = {val: objInput.account_details_corr_acc}    
                bindsObj.adb     = {val: objInput.account_details_bic}     
                bindsObj.toa     = {val: objInput.time_of_activity}    
                bindsObj.capa    = {val: objInput.capital_amount}      
                bindsObj.ftsc    = {val: objInput.federal_tax_service_contacts}    
                bindsObj.afi     = {val: objInput.affiliates_info}         
                //bindsObj.ofo     = {val: objInput.organization_founders }   
               /*  bindsObj.head    = {val: objInput.head_of_organization}    
                bindsObj.chacc   = {val: objInput.chief_accountant}   */  
                // bindsObj.appnum  = {val: objInput.appraisers_number}   
                bindsObj.inscom  = {val: objInput.insurance_companies}     
                bindsObj.appnum  = {val: objInput.appraisers_number    }     
                bindsObj.appiav  = {val: objInput.appraisers_inv_availability}     
                bindsObj.qtyapp  = {val: objInput.quantity_appraisers     }     
                bindsObj.avgrepm = {val: objInput.avg_qty_reports_in_mounth  }   
                bindsObj.extmax  = {val: objInput.inv_external_max     }    
                bindsObj.maxrep  = {val: objInput.max_reports}     
                bindsObj.partnb  = {val: objInput.partner_banks}   
                bindsObj.wrkinf  = {val: objInput.works_info}      
                bindsObj.rvc     = {val: objInput.rvc}     
                bindsObj.idty    = {val: objInput.id_type}     
                bindsObj.actaddr = {val: objInput.actual_address_locality    }     
                bindsObj.subs    = {val: objInput.subsidiaries}    
                bindsObj.sumins  = {val: objInput.sum_insured}     
                bindsObj.dtst    = {val: objInput.date_of_start_insurance_policy}      
                bindsObj.dten    = {val: objInput.date_of_end_insurance_policy}    
                bindsObj.qtydc   = {val: objInput.quantity_appraisers_declared	}      
                bindsObj.regpl   = {val: objInput.reg_place}   
                bindsObj.regag   = {val: objInput.reg_agency}      
                //bindsObj.ctypr = {val: objInput.city_of_presence }    
                bindsObj.pres    = {val: JSON.stringify(objInput.presence_locality) }
                
                bindsObj.tyco    = {val: objInput.type_company }
                console.log(now.toLocaleString("en-US", dateOptions))
                bindsObj.dadd    = {val: now.toLocaleString("en-US", dateOptions) }
                bindsObj.auth    = {val: ip }
            
                break;
    
            case "trouble_signal":
    
                    bindsObj.usn     = {val: objInput.username,   	   type: oracledb.STRING , maxSize: 1000*2 }  //username
                    bindsObj.depa    = {val: objInput.department, 	   type: oracledb.STRING , maxSize: 1000*2 }  //department    
                    bindsObj.idc     = {val: objInput.id_company, 	   type: oracledb.NUMBER } 
                    bindsObj.stat    = {val: objInput.state, 	  	   type: oracledb.STRING , maxSize: 128*2  }  //state        
                    bindsObj.totr    = {val: objInput.type_of_trouble, type: oracledb.STRING , maxSize: 128*2  }  //type_of_trouble                   
                    bindsObj.descr   = {val: objInput.description, 	   type: oracledb.STRING , maxSize: 4000*2 }  //description    
                       
                    bindsObj.auth    = {val: ip ,					   type: oracledb.STRING , maxSize: 32*2 }     // AUTHOR_ADD   
					
                    //bindsObj.dadd    = {val: now.toLocaleString("en-US", dateOptions) }
    
                    bindsObj.numr    = {val: objInput.NUM_REPORT, type: oracledb.STRING , maxSize: 256*2 }    // NUM_REPORT    
                    bindsObj.devi    = {val: objInput.DEVIATION,  type: oracledb.NUMBER }      
    
    
                   /*  // Одна проблема
                    "troubles": [{ 
                        "type" : "Тип пробелмы",
                        "description" : "Описание"                
                    }]
    
                    // n-проблем
                    "troubles": [{ 
                                    "type" : "Тип пробелмы1",
                                    "description" : "Описание1"                
                                    },
                                    { 
                                    "type" : "Тип пробелмы2",
                                    "description" : "Описание2"                
                                    },
                                    ...
                                    { 
                                    "type" : "Тип пробелмыn",
                                    "description" : "Описаниеn"                
                                }]  */               
    
    
                break;
    
            case "baudit-add-new-row-budget":
            console.log('there -> baudit-add-new-row-budget')
    
                let budget = objInput.budgetData;
                let main   = objInput.main;
                let {id} = data
    
                let id_type_realty
                
                if ( objInput.specificationData.ID_INDUSTRY ){				
                    id_type_realty = objInput.specificationData.ID_INDUSTRY 
                    
                } else if( objInput.specificationData.ID_TYPE_STOCK ){
                    id_type_realty = 171 // Складские помещения
                
                } else if ( objInput.specificationData.ID_TYPE_REALTY ){
                    id_type_realty = objInput.specificationData.ID_TYPE_REALTY 
                    
                } else {
                    id_type_realty = undefined
                }
                
                    
                console.log("id_type_realty = " + id_type_realty )
                console.log("objInput.specificationData.ID_INDUSTRY = "    + objInput.specificationData.ID_INDUSTRY    )
                console.log("objInput.specificationData.ID_TYPE_REALTY = " + objInput.specificationData.ID_TYPE_REALTY )
                
                
                bindsObj.id_type_realty  = { val: parseInt( id_type_realty )  ,    type: oracledb.NUMBER } 
    
                bindsObj.date_use                       = { val: ( main.DATE_USE.length )? main.DATE_USE : undefined,  type: oracledb.STRING, maxSize: 24*2 }            
           
                bindsObj.id_returned                    = { val:   parseInt( id ),         type: oracledb.NUMBER }
    
                bindsObj.builder_company                = { val:   main.BUILDER_COMPANY,                type: oracledb.STRING, maxSize: 80*2 }
                bindsObj.id_region                      = { val:   parseInt( main.ID_REGION ),          type: oracledb.NUMBER }
                bindsObj.date_budg                      = { val:   main.DATE_BUDG,                      type: oracledb.STRING, maxSize: 24*2 }
                
    
                bindsObj.budg_rent                      = { val: budget.BUDG_RENT,                      type: oracledb.NUMBER }
                bindsObj.budg_pir                       = { val: budget.BUDG_PIR,                       type: oracledb.NUMBER }
                bindsObj.budg_prepar_constr_area        = { val: budget.BUDG_PREPAR_CONSTR_AREA,        type: oracledb.NUMBER }
                bindsObj.budg_smr_zero_circle           = { val: budget.BUDG_SMR_ZERO_CIRCLE,           type: oracledb.NUMBER }
                bindsObj.budg_smr_build                 = { val: budget.BUDG_SMR_BUILD,                 type: oracledb.NUMBER }
                bindsObj.budg_facade                    = { val: budget.BUDG_FACADE,                    type: oracledb.NUMBER }
                bindsObj.budg_roof                      = { val: budget.BUDG_ROOF,                      type: oracledb.NUMBER }
                bindsObj.budg_int_fin_work              = { val: budget.BUDG_INT_FIN_WORK,              type: oracledb.NUMBER }
                bindsObj.budg_heating                   = { val: budget.BUDG_HEATING,                   type: oracledb.NUMBER }
                bindsObj.budg_ventilation               = { val: budget.BUDG_VENTILATION,               type: oracledb.NUMBER }
                bindsObj.budg_plumbing                  = { val: budget.BUDG_PLUMBING,                  type: oracledb.NUMBER }
                bindsObj.budg_sewerage                  = { val: budget.BUDG_SEWERAGE,                  type: oracledb.NUMBER }
                bindsObj.budg_elec_lighting             = { val: budget.BUDG_ELEC_LIGHTING,             type: oracledb.NUMBER }
                bindsObj.budg_gas                       = { val: budget.BUDG_GAS,                       type: oracledb.NUMBER }
                bindsObj.budg_furniture_inven           = { val: budget.BUDG_FURNITURE_INVEN,           type: oracledb.NUMBER }
                bindsObj.budg_techn_equip               = { val: budget.BUDG_TECHN_EQUIP,               type: oracledb.NUMBER }
                bindsObj.budg_communication_net         = { val: budget.BUDG_COMMUNICATION_NET,         type: oracledb.NUMBER }
                bindsObj.budg_water_out                 = { val: budget.BUDG_WATER_OUT,                 type: oracledb.NUMBER }
                bindsObj.budg_ven_out                   = { val: budget.BUDG_VEN_OUT,                   type: oracledb.NUMBER }
                bindsObj.budg_elec_supply_out           = { val: budget.BUDG_ELEC_SUPPLY_OUT,           type: oracledb.NUMBER }
                bindsObj.budg_gas_out                   = { val: budget.BUDG_GAS_OUT,                   type: oracledb.NUMBER }
                bindsObj.budg_telephone_out             = { val: budget.BUDG_TELEPHONE_OUT,             type: oracledb.NUMBER }
                bindsObj.budg_water_ext                 = { val: budget.BUDG_WATER_EXT,                 type: oracledb.NUMBER }
                bindsObj.budg_sewerage_ext              = { val: budget.BUDG_SEWERAGE_EXT,              type: oracledb.NUMBER }
                bindsObj.budg_elec_ext                  = { val: budget.BUDG_ELEC_EXT,                  type: oracledb.NUMBER }
                bindsObj.budg_heat_ext                  = { val: budget.BUDG_HEAT_EXT,                  type: oracledb.NUMBER }
                bindsObj.budg_cost_of_customer          = { val: budget.BUDG_COST_OF_CUSTOMER,          type: oracledb.NUMBER }
                bindsObj.budg_build_control             = { val: budget.BUDG_BUILD_CONTROL,             type: oracledb.NUMBER }
                bindsObj.budg_temp_buildings            = { val: budget.BUDG_TEMP_BUILDINGS,            type: oracledb.NUMBER }
                bindsObj.budg_other_costs               = { val: budget.BUDG_OTHER_COSTS,               type: oracledb.NUMBER }
                bindsObj.budg_unexp_costs               = { val: budget.BUDG_UNEXP_COSTS,               type: oracledb.NUMBER }
          
                bindsObj.budg_rent_curval               = { val: budget.BUDG_RENT_CURVAL,               type: oracledb.NUMBER }
                bindsObj.budg_pir_curval                = { val: budget.BUDG_PIR_CURVAL,                type: oracledb.NUMBER }
                bindsObj.budg_prepar_constr_area_curval = { val: budget.BUDG_PREPAR_CONSTR_AREA_CURVAL, type: oracledb.NUMBER }
                bindsObj.budg_smr_zero_circle_curval    = { val: budget.BUDG_SMR_ZERO_CIRCLE_CURVAL,    type: oracledb.NUMBER }
                bindsObj.budg_smr_build_curval          = { val: budget.BUDG_SMR_BUILD_CURVAL,          type: oracledb.NUMBER }
                bindsObj.budg_facade_curval             = { val: budget.BUDG_FACADE_CURVAL,             type: oracledb.NUMBER }
                bindsObj.budg_roof_curval               = { val: budget.BUDG_ROOF_CURVAL,               type: oracledb.NUMBER }
                bindsObj.budg_int_fin_work_curval       = { val: budget.BUDG_INT_FIN_WORK_CURVAL,       type: oracledb.NUMBER }
                bindsObj.budg_heating_curval            = { val: budget.BUDG_HEATING_CURVAL,            type: oracledb.NUMBER }
                bindsObj.budg_ventilation_curval        = { val: budget.BUDG_VENTILATION_CURVAL,        type: oracledb.NUMBER }
                bindsObj.budg_plumbing_curval           = { val: budget.BUDG_PLUMBING_CURVAL,           type: oracledb.NUMBER }
                bindsObj.budg_sewerage_curval           = { val: budget.BUDG_SEWERAGE_CURVAL,           type: oracledb.NUMBER }
                bindsObj.budg_elec_lighting_curval      = { val: budget.BUDG_ELEC_LIGHTING_CURVAL,      type: oracledb.NUMBER }
                bindsObj.budg_gas_curval                = { val: budget.BUDG_GAS_CURVAL,                type: oracledb.NUMBER }
                bindsObj.budg_furniture_inven_curval    = { val: budget.BUDG_FURNITURE_INVEN_CURVAL,    type: oracledb.NUMBER }
                bindsObj.budg_techn_equip_curval        = { val: budget.BUDG_TECHN_EQUIP_CURVAL,        type: oracledb.NUMBER }
                bindsObj.budg_water_out_curval          = { val: budget.BUDG_WATER_OUT_CURVAL,          type: oracledb.NUMBER }
                bindsObj.budg_ven_out_curval            = { val: budget.BUDG_VEN_OUT_CURVAL,            type: oracledb.NUMBER }
                bindsObj.budg_elec_supply_out_curval    = { val: budget.BUDG_ELEC_SUPPLY_OUT_CURVAL,    type: oracledb.NUMBER }
                bindsObj.budg_gas_out_curval            = { val: budget.BUDG_GAS_OUT_CURVAL,            type: oracledb.NUMBER }
                bindsObj.budg_telephone_out_curval      = { val: budget.BUDG_TELEPHONE_OUT_CURVAL,      type: oracledb.NUMBER }
                bindsObj.budg_water_ext_curval          = { val: budget.BUDG_WATER_EXT_CURVAL,          type: oracledb.NUMBER }
                bindsObj.budg_sewerage_ext_curval       = { val: budget.BUDG_SEWERAGE_EXT_CURVAL,       type: oracledb.NUMBER }
                bindsObj.budg_elec_ext_curval           = { val: budget.BUDG_ELEC_EXT_CURVAL,           type: oracledb.NUMBER }
                bindsObj.budg_heat_ext_curval           = { val: budget.BUDG_HEAT_EXT_CURVAL,           type: oracledb.NUMBER }
                bindsObj.budg_cost_of_customer_curval   = { val: budget.BUDG_COST_OF_CUSTOMER_CURVAL,   type: oracledb.NUMBER }
                bindsObj.budg_build_control_curval      = { val: budget.BUDG_BUILD_CONTROL_CURVAL,      type: oracledb.NUMBER }
                bindsObj.budg_temp_buildings_curval     = { val: budget.BUDG_TEMP_BUILDINGS_CURVAL,     type: oracledb.NUMBER }
        
                bindsObj.objects_auxiliary              = { val: budget.OBJECTS_AUXILIARY,              type: oracledb.NUMBER }
                bindsObj.budg_accomplishment            = { val: budget.BUDG_ACCOMPLISHMENT,            type: oracledb.NUMBER }
                console.log("spec.DOCUMENTS " + spec.DOCUMENTS)
                bindsObj.documents                      = { val: spec.DOCUMENTS,        type: oracledb.STRING, maxSize: 1000*2 }
                // bindsObj.documents                      = { val: JSON.stringify(spec.DOCUMENTS),        type: oracledb.STRING, maxSize: 1000 }
                
    
                bindsObj.author_ip = { val: ip }   
                bindsObj.date_add  = { val: now.toJSON(), type: oracledb.STRING , maxSize: 24*2 } // { val: now.toJSON() }
    
                bindsObj.id = { type: oracledb.NUMBER, dir : oracledb.BIND_OUT }
                
                break; 
    
           case "baudit-add-new-row-living":
    
                console.log('there -> baudit-add-new-row-living')                   
    
                    bindsObj.total_area             = { val: spec.TOTAL_AREA ,            type: oracledb.NUMBER }
                    bindsObj.tot_flat_area          = { val: spec.TOT_FLAT_AREA ,         type: oracledb.NUMBER }
                    bindsObj.area_apart             = { val: spec.AREA_APART ,            type: oracledb.NUMBER }
                    bindsObj.num_parking            = { val: spec.NUM_PARKING ,           type: oracledb.NUMBER }
                    bindsObj.undergr_parking_exist  = { val: spec.UNDERGR_PARKING_EXIST , type: oracledb.NUMBER }
                    bindsObj.undergr_parking_expl   = { val: spec.UNDERGR_PARKING_EXPL ,  type: oracledb.STRING, maxSize: 100*2 }
                    bindsObj.num_floors             = { val: spec.NUM_FLOORS ,            type: oracledb.NUMBER }
                    bindsObj.build_vol              = { val: spec.BUILD_VOL ,             type: oracledb.NUMBER }
                    bindsObj.id_bearing_constr      = { val: spec.ID_BEARING_CONSTR ,     type: oracledb.NUMBER }
                    bindsObj.id_fence_struct        = { val: spec.ID_FENCE_STRUCT ,       type: oracledb.NUMBER }
                    bindsObj.id_class_qual_liv      = { val: spec.ID_CLASS_QUAL_LIV ,     type: oracledb.NUMBER }
                    bindsObj.id_elevator            = { val: spec.ID_ELEVATOR ,           type: oracledb.NUMBER }
                    
    
                    bindsObj.condition              = { val: ( objInput.main.DATE_USE.length )? 1: 0 ,   type: oracledb.NUMBER }
                    // bindsObj.condition              = { val: 0 ,   type: oracledb.NUMBER }
    
                    bindsObj.id_status              = { val: 222 ,   type: oracledb.NUMBER }    // На согласовании
    
                    bindsObj.id_returning           = { type: oracledb.NUMBER, dir : oracledb.BIND_OUT }
                
                break;
    
          case "baudit-add-new-row-commercial":
              
                      console.log('there -> baudit-add-new-row-commercial')
                      
    
                          bindsObj.total_area        = {  val: spec.TOTAL_AREA        , type: oracledb.NUMBER   }        
                          bindsObj.build_vol         = {  val: spec.BUILD_VOL         , type: oracledb.NUMBER   }        
                          bindsObj.eng_equip_exist   = {  val: spec.ENG_EQUIP_EXIST   , type: oracledb.NUMBER   }                    
                          bindsObj.undergr_exist     = {  val: spec.UNDERGR_EXIST     , type: oracledb.NUMBER   }              
                          bindsObj.eng_equip_expl    = {  val: spec.ENG_EQUIP_EXPL    , type: oracledb.STRING, maxSize: 100*2   }                 
                          bindsObj.undergr_expl      = {  val: spec.UNDERGR_EXPL      , type: oracledb.STRING, maxSize: 100*2   }              
                          bindsObj.num_floors        = {  val: spec.NUM_FLOORS        , type: oracledb.NUMBER   }        
                          bindsObj.id_video_surv     = {  val: spec.ID_VIDEO_SURV     , type: oracledb.NUMBER   }              
                          bindsObj.id_bearing_constr = {  val: spec.ID_BEARING_CONSTR , type: oracledb.NUMBER   }                       
                          bindsObj.id_fence_struct   = {  val: spec.ID_FENCE_STRUCT   , type: oracledb.NUMBER   }                    
                          bindsObj.id_class_qual_com = {  val: spec.ID_CLASS_QUAL_COM , type: oracledb.NUMBER   }                       
                          bindsObj.id_type_build     = {  val: (spec.ID_TYPE_STOCK)? 171 : spec.ID_INDUSTRY , type: oracledb.NUMBER }              
                          bindsObj.id_industry       = {  val: spec.ID_INDUSTRY       , type: oracledb.NUMBER   }           
                          bindsObj.id_subindustry    = {  val: spec.ID_INDUSTRY       , type: oracledb.NUMBER   }                 
                          bindsObj.id_roof           = {  val: spec.ID_ROOF           , type: oracledb.NUMBER   }  
                          bindsObj.id_win_gate       = {  val: spec.ID_WIN_GATE       , type: oracledb.NUMBER   }           
                          bindsObj.id_elevator       = {  val: spec.ID_ELEVATOR       , type: oracledb.NUMBER   }           
                          bindsObj.id_proj_sol       = {  val: spec.ID_PROJ_SOL       , type: oracledb.NUMBER   }           
                          bindsObj.condition         = {  val: ( objInput.main.DATE_USE.length )? 1: 0 , type: oracledb.NUMBER }        
                          bindsObj.id_status         = {  val: 222                    , type: oracledb.NUMBER   }    // На согласовании        
                          bindsObj.id_type_stock     = {  val: spec.ID_TYPE_STOCK     , type: oracledb.NUMBER   }              
    
          
                          bindsObj.id_returning      = { type: oracledb.NUMBER, dir : oracledb.BIND_OUT }
                      
                      break;   
                                        
                      
            case "baudit-action":
    
                            bindsObj.username       = {val: objInput.USERNAME,       type: oracledb.STRING , maxSize: 128*2 }
                            //bindsObj.ts_action      = {val: now.toJSON(),            type: oracledb.STRING , maxSize: 24}    
                            bindsObj.id_action      = {val: objInput.ID_ACTION,      type: oracledb.NUMBER }  
                            bindsObj.id_row         = {val: objInput.ID_ROW,         type: oracledb.NUMBER }                      
                            bindsObj.status_comment = {val: objInput.STATUS_COMMENT, type: oracledb.STRING , maxSize: 500*2 }                      
            
                        break;
    
    
            // baudit-action-error-handling
         /*    case "baudit-action-error-handling":
    
                            bindsObj.username       = {val: objInput.USERNAME,       type: oracledb.STRING , maxSize: 128*2 }
                            //bindsObj.ts_action      = {val: now.toJSON(),            type: oracledb.STRING , maxSize: 24}    
                            bindsObj.id_action      = {val: objInput.ID_ACTION,      type: oracledb.NUMBER }  
                            bindsObj.id_row         = {val: objInput.ID_ROW,         type: oracledb.NUMBER }                      
                            bindsObj.status_comment = {val: objInput.STATUS_COMMENT, type: oracledb.STRING , maxSize: 500*2 }                      
            
                        break; */
    
    
    
            case "test":
    
                bindsObj.dt   =  { val: objInput.date }
    
                
    
    
            break;            
    
        }
    
        return bindsObj
    
      },
    
      //
      bindArrMakerMany (objInput, ip, type) {
    
        // { val: '0' }
        let i = 0
    
        var now = new Date()
    
        var bindsArr = [];
    
        switch(type) {
            
            case 'staff': 
    
                for (var key in objInput) {
    
                    bindsArr[i] = {}    //
            
                    bindsArr[i].pos    =  objInput[key].status   
                    bindsArr[i].fulln  =  objInput[key].fullname    
            
                    bindsArr[i].dtb    =  objInput[key].dateborn   // { val: '29.06.2019' }
            
                    bindsArr[i].plb    =  objInput[key].placeborn
                    bindsArr[i].passp  =  objInput[key].passport
                    bindsArr[i].passpi =  objInput[key].passport_issuer
                    bindsArr[i].passpd =  objInput[key].passport_date
                    bindsArr[i].addrr  =  objInput[key].address_reg
                    bindsArr[i].expc   =  objInput[key].experience_in_company == undefined? '' : objInput[key].experience_in_company
                    bindsArr[i].phn    =  objInput[key].phone_num             == undefined? '' : objInput[key].phone_num
                    bindsArr[i].empc   =  objInput[key].empl_contract         == undefined? '' : objInput[key].empl_contract
                    bindsArr[i].dipl   =  objInput[key].diplom                == undefined? '' : objInput[key].diplom
                    bindsArr[i].orgn   =  objInput[key].selfreg_org_name      == undefined? '' : objInput[key].selfreg_org_name
                    bindsArr[i].prfd   =  objInput[key].selfreg_proof_doc     == undefined? '' : objInput[key].selfreg_proof_doc
            
                    bindsArr[i].insp   =  objInput[key].insurance_policy      == undefined? '' : objInput[key].insurance_policy
                    bindsArr[i].insc   =  objInput[key].insurance_company     == undefined? '' : objInput[key].insurance_company
                    bindsArr[i].insa   =  objInput[key].insurance_amount      == undefined? '' : objInput[key].insurance_amount
            
                    bindsArr[i].inds   =  objInput[key].insurance_start_date
                    bindsArr[i].inde   =  objInput[key].insurance_end_date
            
                    bindsArr[i].expa   =  objInput[key].experience_all        == undefined? '' : objInput[key].experience_all 
            
                    /* 
                    bindsArr[i].qcd    =  objInput[key].qual_cert_direction
                    bindsArr[i].qcn    =  objInput[key].qual_cert_num
                    bindsArr[i].qcds   =  objInput[key].qual_cert_date_start 
                    */
            
                    bindsArr[i].idc    =  objInput[key].id_company
                    bindsArr[i].addr   =  objInput[key].address_residential 
            
                    bindsArr[i].cert   = JSON.stringify(objInput[key].cert_data)
            
                    bindsArr[i].dadd   = now.toLocaleString("en-US", dateOptions) 
                    bindsArr[i].auth   = ip        
                    
                    i++;
            
                }
    
                break;
    
        }    
    
        return bindsArr
    
      }
    

}
