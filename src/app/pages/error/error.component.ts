import { Component } from '@angular/core';
import { ResponseDTO } from '../../models/output.model';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {
  errorData: ResponseDTO = {
    message: "Oops! Ocurrió un error inesperado.",
    status: 500
  };

  constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.errorService.currentError.subscribe(data => {
      if (data) {
        this.errorData = data;
      }
    });
  }
}