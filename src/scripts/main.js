import Display from './display'
import Gradient from './gradient'

let gradient = new Gradient()
let state = 'focus'

$('#home').on('click', function () {
  $('#home').addClass('hide')
  $('#about').removeClass('no-display')
  $('.overlay').addClass('active')

  setTimeout(() => {
    $('#home').addClass('no-display')
    $('#about').removeClass('hide')
  }, 1000)
})

$('section').on('click', 'button', function () {
  let cur = $(this).closest('section')
  let next = $(this).closest('section').next('section')

  nextSection(cur, next)
})

$('#choice button').on('click', function () {
  state = $(this).data('state')
  $('.help-' + state).addClass('active')
})

function nextSection (cur, next) {
  cur.addClass('hide')
  next.removeClass('no-display')

  setTimeout(() => {
    cur.addClass('no-display')
    next.removeClass('hide')

    if (next.attr('id') == 'start') {
      setTimeout(() => {
        nextSection(next, next.closest('section').next('section'))

        let display = null

        if (state == 'music') {
          display = new Display(true)
        } else {
          display = new Display(false)
        }

        setTimeout(() => {
          display.start(state)
        }, 1000)
      }, 5000)
    }
  }, 500)
}
