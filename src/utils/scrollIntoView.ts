export default function(dom) {
  if (dom) {
    if (dom.scrollIntoViewIfNeeded) {
      dom.scrollIntoViewIfNeeded();
    } else {
      dom.scrollIntoView({ block: 'center' });
    }
  }
}
