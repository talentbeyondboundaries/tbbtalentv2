import {Component, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {IntakeComponentBase} from "../../../util/intake/IntakeComponentBase";
import {CandidateService} from "../../../../services/candidate.service";
import {EnumOption, enumOptions} from "../../../../util/enum";
import {ReturnedHome} from "../../../../model/candidate";

@Component({
  selector: 'app-returned-home',
  templateUrl: './returned-home.component.html',
  styleUrls: ['./returned-home.component.scss']
})
export class ReturnedHomeComponent extends IntakeComponentBase implements OnInit {

  public returnedHomeOptions: EnumOption[] = enumOptions(ReturnedHome);

  constructor(fb: FormBuilder, candidateService: CandidateService) {
    super(fb, candidateService);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      returnedHome: [this.candidateIntakeData?.returnedHome],
      returnedHomeReason: [this.candidateIntakeData?.returnedHomeReason],
      returnedHomeNotes: [this.candidateIntakeData?.returnedHomeNotes],
    });
  }

  get returnedHome(): string {
    return this.form.value?.returnedHome;
  }

}
