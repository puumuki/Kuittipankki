define(function(require) {

  var datePickerTranslation= {
    closeText: 'Sulje',
    prevText: '&laquo;Edellinen',
    nextText: 'Seuraava&raquo;',
    currentText: 'T&auml;n&auml;&auml;n',
    monthNames: ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kes&auml;kuu',
                 'Hein&auml;kuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'],
    monthNamesShort: ['Tammi','Helmi','Maalis','Huhti','Touko','Kes&auml;',
                      'Hein&auml;','Elo','Syys','Loka','Marras','Joulu'],
    dayNamesShort: ['Su','Ma','Ti','Ke','To','Pe','Su'],
    dayNames: ['Sunnuntai','Maanantai','Tiistai','Keskiviikko','Torstai','Perjantai','Lauantai'],
    dayNamesMin: ['Su','Ma','Ti','Ke','To','Pe','La'],
    weekHeader: 'Vk',
    dateFormat: 'dd.mm.yy',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''
  };

  var lang = {
    'receipt.productname'     : 'Tuotteen nimi',
    'receipt.purchasedate'    : 'Hankintapäivä',
    'receipt.guaranteedate'   : 'Takuupäättyy',
    'receipt.store'           : 'Kauppa',
    'receipt.price'           : 'Tuotteen hinta',
    'receipt.registered'      : 'Rekisteröity',
    'receipt.description'     : 'Kuvaus',
    'receipt.noimages'        : 'Ei kuvia',
    'receipt.images'          : 'Kuvat',
    'receipt.keywords'        : 'Avainsanat',
    'receipt.purchaced-since' : 'Ostettu {{fromPurchase}} sitten',
    'receipt.age'             : 'y [vuotta] d [päivää]',
    'receipt.noname'          : '-- ei nimeä --',
    'btn.edit'                : 'Muokkaa',
    'btn.copy'                : 'Kopio',
    'btn.delete'              : 'Poista',
    'btn.save'                : 'Tallenna',
    'btn.cancel'              : 'Peruuta',
    'btn.back'                : 'Takaisin',
    'main-menu.sign-in'       : 'Kirjaudu',
    'main-menu.sign-out'      : 'Uloskirjaudu {{username}}',
    'main-menu.receipts'      : 'Kuitit',
    'main-menu.reports'       : 'Raportit',
    'main-menu.title'         : 'Kuittipankki',
    'receipt-list.no-receipts': 'Ei yhtään kuitteja saatavilla',
    'receipt-list.sort.name'  : 'Nimi',
    'receipt-list.sort.date'  : 'Päivämäärä',
    'receipt-list.new-receipt': 'Uusi',
    'user.dialog.title'       : 'Käyttäjän asetukset',
    'user.language'           : 'Kieli',
    'user.language.fi'        : 'Suomi',
    'user.language.en'        : 'Englanti',
    'report.totalcount'       : 'Kuitteja yhteensä {{count}} kpl',
    'report.export.csv'       : 'Vie CSV tiedostona',
    'report.export.json'      : 'Vie JSON tiedostona'
  };

  return {
    datePickerTranslation: datePickerTranslation,
    lang: lang
  };

});
