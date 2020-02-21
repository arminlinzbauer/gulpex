# GulpEx
**Attention: Readme File Refers to Previous Tool "IceBucket" & Needs Critical Update!**
\
\
\
Konfigurierbarer Gulp Wrapper zur einfachen Einrichtung und Integration der Sass- und JavaScript-Transpiler in neuen Projekten \

## INDEX
1. [KOMPATIBILITÄT](#kompatibilität)
2. [STANDARD TASKS](#standard-tasks)
3. [KONFIGURATION](#konfiguration)
4. [LEGACY STYLES](#legacy-styles)

## KOMPATIBILITÄT

Wenn noch eine alte Version von Gulp im Projekt (und Global) installiert ist 
(< Gulp 4.0.0), muss diese erst mit `npm uninstall -g gulp` und im Projektverzeichnis
 mit `npm uninstall gulp` entfernt werden **(WICHTIG!!!)**.
Danach muss die neuste Gulp-Version mittels `npm install -g gulp` global 
installiert werden. Im Projekt mit `npm install -D gulp` ebenfalls die neuste 
Version installieren **(WICHTIG!!!)**.

## STANDARD TASKS

TASK | BESCHREIBUNG
-----|-------------
init	    | Nach Checkout/Update Dateien z.B. an richtige Stelle kopieren, Libraries bundeln
convert-js  | Development-Javascript Bundle ausspielen inkl. Sourcemaps -> bundle.js
convert-css | Development-CSS Bundle ausspielen inkl. Sourcemaps -> filename.css
convert     | &rarr; (convert-js + convert-css)
deploy-js   | Production-Javascript Bundle ausspielen exkl. Sourcemaps -> bundle.min.js
deploy-css  | Development-CSS Bundle ausspielen exkl. Sourcemaps -> bundle.min.js
deploy      | &rarr; (deploy-js + deploy-css)
watch       | &rarr; (convert + [recompile on change] + [reload CSS])

## KONFIGURATION

Die "gulpfile.js"-Datei wurde so konzipiert, dass sie nicht verändert werden 
muss. Zum konfigurieren der Projektstruktur können die Variablen der gulpconfig.js-Datei 
bearbeitet werden. Genauere erläuterungen zu den Funktionen der einzelnen Variablen sind
den Kommentaren in der Datei zu entnehmen.

Das Bereitstellen von Bundles geschieht in der bundles.json-Datei. Diese setzt sich 
hauptsächlich aus den folgenden Knotenpunkten zusammen:

 - legacyCss (siehe [LEGACY STYLES](#legacy-styles))
 - bundles
 - styles
 - includePaths
 - assets
 
**ACHTUNG:** Alle Pfadangaben in der bundles.json-Datei müssen entweder absolut oder 
relativ zum Projektverzeichnis und mit './' beginnend angegeben werden.

### Bundles
Hier werden im Key-Value-Verfahren mehrere Bundle-Objekte mit eindeutigem Schlüssel
hinterlegt. Ein einzelnses Bundle-Objekt hat die folgende Struktur:

```
key: {

  name: String,     // Der Name der zu generierenden Bundle-Datei.
  
  path: String,     // Der Ausgabepfad der zu generierenden Bundle-Datei
                    // Wird nichts angegeben, wird der in der gulpconfig.js
                    // angegebene Pfad der 'scriptsDir'-Variable verwendet.
  
  files: String[],  // Die Dateien, die zum Bundle zusammengefügt werden sollen
  
  minify: Boolean,  // Schaltet die Minifizierung der Bundle-Datei ein oder aus
                    // Die Minifizierung findet in jedem Fall nur beim Deployment statt
                    // Wird nichts angegeben, wird die Minifizierung automatisch aktiviert
                     
  watch: Boolean    // Schaltet den Watcher für das Bundle ein oder aus
                    // Wird nichts angegeben, wird der Watcher automatisch aktiviert.

}
```

Es können beliebig viele Bundles angelegt werden. Stellen Sie nur sicher, dass jedes Bundle 
einen eindeutigen Key erhält.

### Styles
Hier werden im Key-Value-Verfahren mehrere Stylesheet-Objekte mit eindeutigem Schlüssel
hinterlegt. Ein einzelnses Stylesheet-Objekt hat die folgende Struktur:

```
key: {
  
  path: String,     // Der Ausgabepfad der zu generierenden CSS-Datei(en)
                    // Wird nichts angegeben, wird der in der gulpconfig.js
                    // angegebene Pfad der 'cssDirectory'-Variable verwendet.
  
  files: String[],  // Die SCSS- / Sass-Dateien, die mit in CSS-Dateien kompiliert werden sollen
  
  minify: Boolean,  // Schaltet die Minifizierung der CSS-Datei(en) ein oder aus
                    // Die Minifizierung findet in jedem Fall nur beim Deployment statt
                    // Wird nichts angegeben, wird die Minifizierung automatisch aktiviert
                     
  watch: Boolean|String[]
                    // Eine Liste von Dateien, die, zusätzlich zu den in 'files' angegebenen
                    // Dateien, vom Watcher beobachtet werden sollen und bei Änderungen das 
                    // Neu-Kompilieren der CSS-Datei(en) auslösen. Alternativ kann der Watcher
                    // mit false deaktiviert werden. 
                    // Wird true oder nichts angegeben, werden nur die unter 'files' angegebenen 
                    // Dateien beobachtet. Dieses Verhalten macht nur Sinn, wenn unter 'files'
                    // ein gesamtes Verzeichnis angegeben wird.  

}
```

Es können beliebig viele CSS-Dateien angelegt werden. In den meisten Fällen reicht allerdings
eine einzige Angabe:

```
"global": {
    "files": [ "./sass/**/*.s[ca]ss" ]
}
```

Auf diese weise wird die klassische Vorgehensweise aus den Vorgängerversionen des Gulp-Standards
simuliert.

### Include Paths
Hier können in einem String-Array Pfade angegeben werden, diebei der Auflösung der 
@import-Direktiven der Sass- / SCSS-Dateien berücksichtigt werden sollen. 

### Assets
Hier können in einem Array Dateien angegeben werden, die während der Initialisierung der Gulp-Tasks 
an einen bestimmten Ort kopiert werden sollen. Dies eignet sich z.B. um wichtige Assets aus dem node_modules-Ordner 
ins öffentliche Document Root zu überführen.

Es gibt drei Möglichkeiten, diese Dateien innerhalb des Arrays anzugeben (jede dieser Möglichkeiten unterstützt GLOB-Patterns). Die verschiedenen Arten können auch vermischt werden:

**Als String**\
Die Quelldatei(en) werden an den in der `gulpconfig.js`-Datei definierten Standard-Pfad `publicAssetsDirectory` kopiert.

**Als Array**\
Die Quelldateien aus `ARR_POS[0]` werden nach `ARR_POS[1]` kopiert. Wird `ARR_POS[1]` nicht gesetzt, wird als Ziel wieder der Standard-Pfad für `publicAssetsDirectory` verwendet.

**Als Objekt**\
Die Quelldateien aus `Object.src` werden nach `Object.dest` kopiert. Wird `Object.dest` nicht gesetzt, wird als Ziel wieder der Standard-Pfad für `publicAssetsDirectory` verwendet.

## LEGACY STYLES

Neuere Versionen von libSass erlauben keine Imports von .css-Dateien mehr. 
Deshalb ist es notwendig, dass bei der Projektinitialisierung alle Legacy-
Styles mit .scss-Extension in den sass-Ordner kopiert werden. Dies passiert
vollautomatisch beim Initialisieren, vor dem Deployment und beim Starten des 
Watchers. Alle Legacy-Stylesheets werden automatisch in einer Include-Datei
importiert. Lediglich die "sass/includes/_libs.scss"-Datei muss noch in ihrer 
Haupt-SCSS-Datei eingebunden werden.

Um Legacy-Stylesheets zu integrieren, listen Sie die Pfade zu den CSS-Dateien
in der bundle.json in einem Array unter dem Knoten `legacyCss` auf.