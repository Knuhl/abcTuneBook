import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TunebooksListComponent } from './tunebooks-list.component';

describe('TunebooksListComponent', () => {
  let component: TunebooksListComponent;
  let fixture: ComponentFixture<TunebooksListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TunebooksListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TunebooksListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
