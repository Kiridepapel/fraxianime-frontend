import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment-prod';
import { AnimeService } from '../../services/anime.service';
import { ChapterDTO } from '../../models/page.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs/internal/Subscription';
import { Mode } from '../../models/individual.model';
import { LanguageService } from '../../services/language.service';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { DownloadDialogComponent } from '../../dialogs/download-dialog/download-dialog.component';
import { ExternalScriptService } from '../../services/external-script.service';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
  templateUrl: './chapter.component.html',
  styleUrl: './chapter.component.scss'
})
export class ChapterComponent {
  public isLoading = true; // Se vuelve false cuando se termina de recibir todos los datos del backend
  public chapterData!: ChapterDTO; // Información del capítulo recibido del backend
  public chapterName!: string; // Nombre del capítulo
  public uri!: string;
  // Subscriptions
  private languageSubscription!: Subscription;
  public language!: Mode;
  // Translate variables
  public translations!: {[key: string]: string};
  // Variables para el reproductor
  public mainSrcIndex = 0;
  public mainSrcOption!: SafeResourceUrl;

  constructor(
    private externalScript: ExternalScriptService,
    private animeService: AnimeService,
    private sanitizer: DomSanitizer,
    private languageService: LanguageService,
    private dialog: MatDialog
  ) {
    this.languageSubscription = this.languageService.language$.subscribe((language: Mode) => {
      this.language = language;
      this.changeTitle();
    });
  }

  async ngOnInit() {
    // Establece como uri la url del anime
    const uri = window.location.href.replace((environment.FRONTEND_URL), "");
    this.uri = uri.split("/")[0];
    
    try {
      await this.animeService.getGenericData(uri).then((data: any) => {
        this.chapterData = data;
        this.mainSrcOption = this.sanitizer.bypassSecurityTrustResourceUrl(this.chapterData.srcOptions[0]?.url);
        this.selectSrc(this.mainSrcIndex, this.chapterData.srcOptions[this.mainSrcIndex]?.url);
        // Carga el script de Disqus
        this.externalScript.loadDisqusScript();
      });
    } finally {
      this.isLoading = false;
      this.changeTitle();
    }
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }

  public verifyActualChapter() {
    let actualChapter = this.chapterData.actualChapter;

    if (!actualChapter.includes('-final')) return actualChapter;
    else return actualChapter.replace('-final', '');
  }

  public getPreviousChapterUrl() {
    return `${this.uri}/${this.chapterData.previousChapter.replace('.', '-')}`;
  }

  public goToAnime() {
    window.location.href = this.uri;
  }

  public getNextChapterUrl() {
    return `${this.uri}/${this.chapterData.nextChapter.replace('.', '-')}`;
  }

  public isPenultimateChapter(): boolean {
    // Si el anime no está en emisión y lastChapter y actualChapter existen,
    // entonces compara si el último capítulo es igual al penúltimo, si es así, devuelve true.
    // Si no se cumple alguna de las condiciones, devuelve false
    if (!this.chapterData.inEmision && this.chapterData.lastChapter && this.chapterData.actualChapter) {
      return Number(this.chapterData.lastChapter) - 1 === Number(this.chapterData.actualChapter);
    } else {
      return false;
    }
  }

  public selectSrc(index: number, url: string) {
    const optionsContainer = document.querySelector('.options');

    if (optionsContainer) {
      this.mainSrcOption = this.sanitizer.bypassSecurityTrustResourceUrl(url);

      const links = optionsContainer.querySelectorAll('a');
      links.forEach(link => link.classList.remove('active'));
  
      if (links[index]) {
        links[index].classList.add('active');
      }
    }
  
    this.mainSrcIndex = index;
  }

  public openDownloadDialog() {
    const config = new MatDialogConfig();
    config.maxWidth = '600px';
    config.width = '90%';
    config.minHeight = '360px';
    config.disableClose = false;
    config.autoFocus = true;
    config.closeOnNavigation = false;
    config.enterAnimationDuration = 500;
    config.exitAnimationDuration = 500;
    config.data = this.chapterData.downloadOptions;

    this.dialog.open(DownloadDialogComponent, config);
  }

  // Muestra el día de la última actualización del anime
  public parseAndFormatDate(value: string, showYear: boolean): string {
    return this.animeService.parseAndFormatDate(value, showYear, this.language.value);
  }

  private changeTitle() {
    if (this.isLoading) {
      document.title = this.textTranslate('Cargando', 'Loading') + '...';
    } else {
      document.title = this.chapterData.name + " " + this.chapterData.actualChapter;
    }
  }
  
  public variablesTranslate(): void {
    this.translations = {
      'Hoy': this.language.value === 'es' ? 'Hoy' : 'Today',
    }
  }

  public dynamicTranslate(key: string): string {
    if (this.translations.hasOwnProperty(key)) {
      return this.translations[key];
    }

    return key;
  }

  public textTranslate(spanish: string, english: string): string {
    return this.languageService.textTranslate(spanish, english);
  }
}
