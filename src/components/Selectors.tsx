import { Button, Col, Form } from 'react-bootstrap'
import React, { ChangeEvent, useEffect, useState } from 'react'

export interface Selector {
  name: string
  value: string
}

interface SelectorsProps {
  onSelectorsChange: (selectors: Selector[]) => void
}

const Selectors = (props: SelectorsProps): JSX.Element => {
  const [selectors, setSelectors] = useState<Selector[]>([
    { name: 'job', value: 'prometheus' }
  ])

  useEffect(() => {
    props.onSelectorsChange(selectors)
  }, [props, selectors])

  const addSelector = (): void => {
    setSelectors([...selectors, { name: '', value: '' }])
  }

  const deleteSelector = (i: number): void => {
    setSelectors([
      ...selectors.slice(0, i),
      ...selectors.slice(i + 1)
    ])
  }

  const changeSelector = (i: number, type: string, next: string) => {
    let { name, value } = selectors[i]

    switch (type) {
      case 'name':
        name = next
        break
      case 'value':
        value = next
        break
    }

    setSelectors([
      ...selectors.slice(0, i),
      { name, value },
      ...selectors.slice(i + 1)
    ])
  }

  return (
    <Form.Group controlId="metric">

      <Form.Row style={{ justifyContent: 'flex-end' }}>
        <Col>
          <h5>Selectors</h5>
        </Col>
        <Col xs="auto">
          <Button variant="light" onClick={addSelector}>+</Button>
        </Col>
      </Form.Row>

      {selectors.map((s: Selector, i: number) => (
        <Form.Row style={{ marginBottom: 10, alignItems: 'flex-end' }} key={i}>
          <Col>
            <Form.Group controlId={`name${i}`} style={{ margin: 0 }}>
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={s.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => changeSelector(i, 'name', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`value${i}`} style={{ margin: 0 }}>
              <Form.Label>Value</Form.Label>
              <Form.Control
                value={s.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => changeSelector(i, 'value', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs="auto">
            <Button
              variant="light"
              onClick={() => deleteSelector(i)}
            >–</Button>
          </Col>
        </Form.Row>
      ))}

    </Form.Group>
  )
}
export default Selectors
