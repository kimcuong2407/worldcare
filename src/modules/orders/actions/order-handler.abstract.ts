import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import StateMachine from 'ts-javascript-state-machine';
import orderStateMachine from './order.state-machine';

abstract class OrderAbstractHandler {
  // eslint-disable-next-line class-methods-use-this

  fsm: StateMachine;

  initState: string;

  private errors: Array<string> = [];

  constructor(initState: string) {
    this.initState = initState;
    this.fsm = orderStateMachine(initState);
  }

  // eslint-disable-next-line class-methods-use-this
  async handle(order: any, payload?: any) {
    throw new ValidationFailedError('Không thực hiện được hành động.');
  }

    // eslint-disable-next-line class-methods-use-this
  async validate(order: any, payload?: any): Promise<boolean> {
    throw new ValidationFailedError('Không thực hiện được hành động.');
  }
}

export default OrderAbstractHandler;
