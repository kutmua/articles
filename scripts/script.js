const GOREST_PATH = 'https://gorest.co.in/public-api/';

// получение данных с сервера
const serverData = async () => {
  const pageParams = new URLSearchParams(window.location.search);
  const pageId = pageParams.get('id');
  let response;

  if (pageId) {
    response = await fetch( `${GOREST_PATH}posts?id=${pageParams.get('id')}` , {
      method: 'GET'
    })
  }
  else {
    response = await fetch (`${GOREST_PATH}posts?page=${pageParams.get('page')}`,{
      method: 'GET'
    })
  }

  const data = await response.json();

  return data;

}

// функция создания главной страници. Проверок и т.п.
async function createMainPage() {
  const data = await serverData();

  // Проверяем на существование страницы. И если нет, то дальше не идем и пишет об этом на страницу
  if (data.meta.pagination.page > data.meta.pagination.pages || data.meta.pagination.page < 0){
    const title = document.createElement('h2');
    title.classList.add('title','error');
    title.innerText = 'Такой страницы нет!';
    document.querySelector('.articles').append(title);
    return;
  }

  const pagePrevNum = (data.meta.pagination.page - 1 < 1) ? 1 : data.meta.pagination.page - 1; // высчитываем номер предыдущей страницы
  const pageNextNum = (data.meta.pagination.page + 1 > data.meta.pagination.pages) ? data.meta.pagination.pages : data.meta.pagination.page + 1; // высчитываем номер следующей страницы
  let btnPageNav = document.querySelectorAll('.btn-nav'); // кнопки переключения страниц
  let pageCount = document.querySelector('.page-count'); // счетчик страниц

  // если мы на главной странице, то счетчик вкл. иначе нет.
  if (pageCount) {
    pageCount.innerText = (`${data.meta.pagination.page}/${data.meta.pagination.pages}`); // счетчик страниц
    // устанавливаем нумерацию страниц для новигации
    btnPageNav.forEach(event => {
      event.addEventListener('click', (el) =>{
        if (el.target.classList.contains('btn-next')) {
          const linkBtnNext = `?page=${pageNextNum}`;
          const btnNextHtml = el.path[0];
  
          btnNextHtml.setAttribute('href', `index.html${linkBtnNext}`);
        }
        else {
          const linkBtnPrev = (pagePrevNum === 1) ? '' : `?page=${pagePrevNum}`;
          const btnPrevHtml = el.path[0];
  
          btnPrevHtml.setAttribute('href', `index.html${linkBtnPrev}`);
        };
      })
    });
  } 

  // проверка, какую страницу отрисовывать (костыль, но работает=) )
  if (document.location.pathname.includes('/index.html')){
    createMainPageContent(data); 
  }
  else createDetailPageContent(data)
}

// функция отрисовки контента главной страницы
async function createMainPageContent(data) {
  const articles = document.getElementById('articles');
  const itemsList = document.createElement('ol');

  itemsList.classList.add('list-group-flush');
  itemsList.classList.add('list-group-numbered');

  data.data.forEach(element => {
    let item = document.createElement('li');
    let link = document.createElement('a');

    item.classList.add('list-group-item');

    link.setAttribute('href',`post.html?id=${element.id}`);
    link.innerText = element.title;

    item.append(link);
    itemsList.append(item);
  });
  articles.append(itemsList);
}

// функция отрисовки контента статей (комментариев и т.д.)
async function createDetailPageContent(data) {
  const articles = document.getElementById('detail-articles');
  const btnPreviousPage = document.querySelector('.btn-previous-page'); // кнопка НАЗАД

  let item = document.createElement('div');
  let title = document.createElement('h1');
  title.classList.add('title-detail-page','mb-3');
  item.classList.add('mb-4')
  btnPreviousPage.setAttribute('href', 'javascript:history.back()');
  
  title.innerText = data.data[0].title;
  item.innerText = data.data[0].body;

  const comments = await getComments(data.data[0].id);
  articles.append(title);
  articles.append(item);
  articles.append(comments);
}

// функция получения комментариев
async function getComments (id) {
  const response = await fetch( `${GOREST_PATH}posts/${id}/comments` , {
    method: 'GET'
  })

  const data = await response.json();
  
  // Если коментов нет то просто возвращаем ничего
  if (!data.data.length){
    return '';
  }

  const comments = document.createElement('ul');
  comments.classList.add('list-group','mb-4');

  data.data.forEach((item) => {
    const comment = document.createElement('li');
    comment.classList.add('list-group-item');

    const name = document.createElement('h5');
    const body = document.createElement('div');
    const email = document.createElement('i');
    email.classList.add('mail');

    name.innerText = item.name;
    body.innerText = item.body;
    email.innerText = item.email;

    comment.append(name)
    comment.append(body)
    comment.append(email)

    comments.append(comment);
  })

  return comments;
}

window.onload = createMainPage();

