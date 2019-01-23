import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TunebookComponent } from './tunebook.component';

describe('TunebookComponent', () => {
  let component: TunebookComponent;
  let fixture: ComponentFixture<TunebookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TunebookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TunebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
