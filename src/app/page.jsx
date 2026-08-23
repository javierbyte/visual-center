import {
  A,
  Container,
  HeaderH3,
  MainHeader,
  MoreExperiments,
  Space,
  Text,
} from 'jbx';

import VisualCenterApp from '../components/VisualCenterApp.jsx';

export default function Page() {
  return (
    <Container>
      <MainHeader>Visual Center</MainHeader>
      <Space h={1} />
      <Text>Find the visual center of your images.</Text>

      <VisualCenterApp />

      <Space h={1} />

      <HeaderH3>Explanation</HeaderH3>
      <Space h={0.5} />
      <Text>
        The <strong>original</strong> image has its bounding box centered in the
        container. This works for most images but when there is a heavy balance
        on one side the image can feel unbalanced. The{' '}
        <strong>visual center</strong> image has added padding so the{' '}
        <i>weight</i> of the pixels is distributed equally in both axis. This
        makes some images look more centered and rotate better.
      </Text>

      <Space h={2} />

      <HeaderH3>How does it work?</HeaderH3>
      <Space h={0.5} />
      <Text>
        This algorithm works by first assigning a <i>color difference value</i>{' '}
        to each pixel as the difference between its color and the detected
        background color. 0 is the same color, 1 is the most different color.
        The weight of each pixel is calculated as the square of the distance of
        this pixel to a given coordinate multiplied by its color difference
        value. The visual center is the coordinate where the total weight on
        each side of both axis is equal.
      </Text>

      <Space h={2} />

      <MoreExperiments exclude="visual-center" />

      <Space h={2} />
      <Text>
        Made by <A href="https://javier.xyz">javierbyte</A>. 2016-2026
      </Text>
    </Container>
  );
}
