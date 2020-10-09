import {Component, OnInit} from '@angular/core';
import {CandidateService} from "../../../../../services/candidate.service";
import {NationalityService} from "../../../../../services/nationality.service";
import {IntakeComponentTabBase} from "../../../../util/intake/IntakeComponentTabBase";

@Component({
  selector: 'app-candidate-intake-tab',
  templateUrl: './candidate-intake-tab.component.html',
  styleUrls: ['./candidate-intake-tab.component.scss']
})
export class CandidateIntakeTabComponent
  extends IntakeComponentTabBase implements OnInit {

  constructor(candidateService: CandidateService,
              nationalityService: NationalityService) {
    super(candidateService, nationalityService)
  }

}
