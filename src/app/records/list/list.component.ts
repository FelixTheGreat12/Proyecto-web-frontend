import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeServiceService } from '../../services/time-service.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { AuthService } from '../../services/auth.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  userId: string | null = null;
  listadoTimes: any[] = [];
  selectedTime: any;
  user: string = ''

  private formBuilder = inject(FormBuilder);
  createForm = this.formBuilder.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
    createdAt: ['', Validators.required],
    updatedAt: ['', Validators.required],
  });

  constructor(
    private timeService: TimeServiceService,
    private spinner: SpinnerComponent,
    private authService: AuthService,
  ) {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('user_id');
    }
    this.user = localStorage.getItem('user') || '';
  }

  editForm = this.formBuilder.group({
    usernameEdit: ['', Validators.required],
    emailEdit: ['', Validators.required],
    passwordEdit: ['', Validators.required],
    createdAtEdit: ['', Validators.required],
    updatedAtEdit: ['', Validators.required],
  });

  get username() {
    return this.createForm.get('username')!;
  }

  get email() {
    return this.createForm.get('email')!;
  }

  get password() {
    return this.createForm.get('password')!;
  }

  get createdAt() {
    return this.createForm.get('createdAt')!;
  }

  get updatedAt() {
    return this.createForm.get('updatedAt')!;
  }

  get usernameEdit() {
    return this.createForm.get('username')!;
  }

  get emailEdit() {
    return this.createForm.get('email')!;
  }

  get passwordEdit() {
    return this.createForm.get('password')!;
  }

  get createdAtEdit() {
    return this.createForm.get('createdAt')!;
  }

  get updatedAtEdit() {
    return this.createForm.get('updatedAt')!;
  }

  ngOnInit(): void {
    this.loadData();
  }

  onSelectTime(time: any) {
    this.selectedTime = time;
    this.editForm.patchValue({
      emailEdit: this.selectedTime.email,
      usernameEdit: this.selectedTime.username,
      passwordEdit: this.selectedTime.password,
      createdAtEdit: this.selectedTime.createdAt,
      updatedAtEdit: this.selectedTime.updatedAt,
    });
  }

  loadData() {
    if (this.userId) {
      this.spinner.show();
      this.timeService.getTimes(Number(this.userId)).subscribe(
        (response) => {
          this.listadoTimes = response.times;
          this.listadoTimes.forEach(time => {
            
          });
          console.log(this.listadoTimes);
          this.spinner.hide();
        },
        (error) => {
          this.authService.logout();
          console.error('Error al cargar los datos', error);
          this.spinner.hide();
        }
      );
    }
  }

  formatDateToISO(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, -1); // Remueve la "Z" final
  }

  private formatDateForInput(date: string): string {
    if (!date) return '';
    const parsedDate = new Date(date);
    return parsedDate.toISOString().slice(0, 16); // Formato compatible con `datetime-local`
  }

  onSubmitCreate() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    // Convertir los tiempos al formato ISO
    const formValue = {
      ...this.createForm.value,
      username: this.createForm.value.username!,
      email: this.createForm.value.email!,
      password: this.createForm.value.password!,
      createdAt: this.createForm.value.createdAt!,
      updatedAt: this.createForm.value.updatedAt!,
    };

    this.timeService.postTime(Number(this.userId), formValue).pipe(
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
        return throwError(error);
      })
    ).subscribe({
      next: (response) => {
        console.log(response);
        this.loadData();
      },
      error: (err) => {
        console.error('Error al crear el registro:', err);
      }
    });
    this.createForm.reset();
  }

  onSubmitEdit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    console.log("enviando");
    const formValue = {
      ...this.editForm.value,
      username: this.editForm.value.usernameEdit!,
      email: this.editForm.value.emailEdit!,
      password: this.editForm.value.passwordEdit!,
      createdAt: this.editForm.value.createdAtEdit!,
      updateAt: this.editForm.value.updatedAtEdit!,
    };

    this.timeService.putTime(Number(this.userId), formValue).pipe(
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
        return throwError(error);
      })
    ).subscribe({
      next: (response) => {
        console.log(response);
        this.loadData();
      },
      error: (err) => {
        console.error('Error al editar el registro:', err);
      }
    });
  }

  onDelete() {
    this.timeService.deleteTime(Number(this.userId)).pipe(
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
        return throwError(error);
      })
    ).subscribe({
      next: (response) => {
        console.log(response);
        this.loadData();
      },
      error: (err) => {
        console.error('Error al borrar el registro:', err);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
