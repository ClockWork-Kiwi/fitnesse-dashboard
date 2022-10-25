import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Form group to hold username and password
  public mainFormGroup = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required],
  });

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
  ) {}

  // Function that runs when user clicks the 'Login' button
  public login() {
    // If any of the required fields are missing, show field errors and return
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    // If both values are supplied, send a login request to the API with the given username and password
    this.userService.login(this.mainFormGroup.get('username').value, this.mainFormGroup.get('password').value);
  }

  ngOnInit() {
  }

}
