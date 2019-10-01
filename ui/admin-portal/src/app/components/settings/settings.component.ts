import { Component, OnInit } from '@angular/core';
import {SearchUsersComponent} from "./users/search-users.component";
import {SearchNationalitiesComponent} from "./nationalities/search-nationalities.component";
import {SearchCountriesComponent} from "./countries/search-countries.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settngs.component.scss']
})
export class SettingsComponent implements OnInit {

  selectedTab;

  public tabs = [
    {
      label: 'Admin Users',
      component: SearchUsersComponent
    },
    {
      label: 'Nationalities',
      component: SearchNationalitiesComponent
    },
    {
      label: 'Countries',
      component: SearchCountriesComponent
    }
  ];

  ngOnInit(){
      this.selectedTab = this.tabs[0];
  }

  setSelectedTab(tab){
    console.log('tab', tab);
    this.selectedTab = tab;
  }
}