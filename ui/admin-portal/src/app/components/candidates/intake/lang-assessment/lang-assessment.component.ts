import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {CandidateService} from '../../../../services/candidate.service';
import {IntakeComponentBase} from '../../../util/intake/IntakeComponentBase';

@Component({
  selector: 'app-lang-assessment',
  templateUrl: './lang-assessment.component.html',
  styleUrls: ['./lang-assessment.component.scss']
})
export class LangAssessmentComponent extends IntakeComponentBase implements OnInit {

  constructor(fb: FormBuilder, candidateService: CandidateService) {
    super(fb, candidateService);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      langAssessment: [this.candidateIntakeData?.langAssessment],
    });
  }

}
