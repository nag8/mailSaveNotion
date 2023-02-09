const SHEET = {
  config: {
    name: 'config',
    range: {
      token: 'B1',
      dbId: 'B2',
    },
  },
};

function main(){

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET.config.name);
  const token = sheet.getRange(SHEET.config.range.token).getValue();
  const dbId = sheet.getRange(SHEET.config.range.dbId).getValue();

  getYesterDayMessageList().forEach(messageList => {
    messageList.forEach(message => {
      const notionRecord = Notion.initRecord();
      notionRecord.setTitle('タイトル', message.getSubject());
      notionRecord.setIcon('📧');
      notionRecord.setPropertiesDatetime('日時', dayjs.dayjs(message.getDate()));
      notionRecord.pushChildrenText(`送信元:${message.getFrom()}`);
      const paragraphList = message.getPlainBody().split(/\n/).reduce((paragraphList, row, index) => {
        return index % 5 === 0 ? [...paragraphList, [row]] : [...paragraphList.slice(0, -1), [...paragraphList[paragraphList.length - 1], row]];
      }, []);
      paragraphList.forEach(paragraph => notionRecord.pushChildrenText(paragraph.join('\n')));
      Notion.initManager(token).createRecord(dbId, notionRecord);
    });
  });
}

function getYesterDayMessageList(){
  const yesterday = dayjs.dayjs().add(-1, 'days');
  const threadList = GmailApp.search(`after:${yesterday.add(-1, 'days').format('YYYY/MM/DD')} before:${yesterday.format('YYYY/MM/DD')}`);
  return GmailApp.getMessagesForThreads(threadList);
  
}
