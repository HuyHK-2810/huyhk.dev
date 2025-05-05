import clsx from 'clsx';
import { SectionTitle } from './section-title';
import Container from '@/components/ui/container';


function FocusedAndOptimized() {
    return (
        <div className={clsx('mb-8')}>
            <Container>
                <SectionTitle
                    title="Can Tho University"
                    caption="Education"
                    description="Information System  | June 2017"
                />
            </Container>
        </div>
    );
}

export default FocusedAndOptimized;
