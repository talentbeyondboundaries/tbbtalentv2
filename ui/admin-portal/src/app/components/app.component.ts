/*
 * Copyright (c) 2021 Talent Beyond Boundaries.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {filter, map} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  showHeader: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) {
  }

  ngOnInit(): void {

    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        if (event['url'] === '/login' || event['url'].indexOf('/reset-password') !== -1) {
          this.showHeader = false;
        } else {
          this.showHeader = true;
        }
      }
    });

    //Hook into router events in order to keep browser title updated based
    //on titles associated with various routes defined in app-routing.module.ts.

    //Default to the currently set title.
    const appTitle = this.titleService.getTitle();

    //Hook into router events
    this.router.events.pipe(
      //Just interested in NavigationEnd events
      filter(event => event instanceof NavigationEnd),

      //Pass on the title string associated with the activated route.
      map(() => {
        //Activated route is the path down through the Routes structure defined
        //in app-routing.module.ts
        let child = this.activatedRoute.firstChild;
        while (child.firstChild) {
          child = child.firstChild;
        }
        if (child.snapshot.data['title']) {
          return child.snapshot.data['title'];
        }
        //Return current title if we didn't find anything else.
        return appTitle;
        }
      )
    ).subscribe(
      (title: string) => {
        this.titleService.setTitle(title);
      }
    );
  }
}
